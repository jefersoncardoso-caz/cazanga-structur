import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')
const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON')

// JWT implementation for Google Service Account authentication
async function createJWT() {
  if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('Google Service Account JSON not configured')
  }

  const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)
  const { private_key, client_email } = serviceAccount

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600 // 1 hour
  }

  const encoder = new TextEncoder()
  
  // Create signature
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const data = `${headerB64}.${payloadB64}`

  // Import private key
  const privateKeyPem = private_key.replace(/\\n/g, '\n')
  const binaryDer = Uint8Array.from(atob(privateKeyPem.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '')), c => c.charCodeAt(0))
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(data)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${data}.${signatureB64}`
}

async function getAccessToken() {
  try {
    const jwt = await createJWT()
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${JSON.stringify(data)}`)
    }

    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

interface SheetData {
  range: string;
  majorDimension: string;
  values: string[][];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    const sheet = url.searchParams.get('sheet')
    const spreadsheetId = url.searchParams.get('spreadsheetId') || SPREADSHEET_ID

    if (!GOOGLE_SHEETS_API_KEY || !spreadsheetId) {
      throw new Error('Google Sheets API key or Spreadsheet ID not configured')
    }

    switch (action) {
      case 'read':
        return await readSheet(sheet || 'Funcionarios', spreadsheetId)
      
      case 'write':
        const body = await req.json()
        return await writeSheet(sheet || 'Funcionarios', body.values, body.range, spreadsheetId)
      
      case 'append':
        const appendBody = await req.json()
        return await appendSheet(sheet || 'Funcionarios', appendBody.values, spreadsheetId)
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function readSheet(sheetName: string, spreadsheetId: string) {
  const range = `${sheetName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`
  
  const response = await fetch(url)
  const data: SheetData = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status} - ${JSON.stringify(data)}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function writeSheet(sheetName: string, values: string[][], range: string, spreadsheetId: string) {
  const accessToken = await getAccessToken()
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?valueInputOption=RAW`
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      values: values
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status} - ${JSON.stringify(data)}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function appendSheet(sheetName: string, values: string[][], spreadsheetId: string) {
  const accessToken = await getAccessToken()
  const range = `${sheetName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      values: values
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status} - ${JSON.stringify(data)}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}