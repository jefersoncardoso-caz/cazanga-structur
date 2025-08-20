import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY')
const SPREADSHEET_ID = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID')

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

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      throw new Error('Google Sheets API key or Spreadsheet ID not configured')
    }

    switch (action) {
      case 'read':
        return await readSheet(sheet || 'Funcionarios')
      
      case 'write':
        const body = await req.json()
        return await writeSheet(sheet || 'Funcionarios', body.values, body.range)
      
      case 'append':
        const appendBody = await req.json()
        return await appendSheet(sheet || 'Funcionarios', appendBody.values)
      
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

async function readSheet(sheetName: string) {
  const range = `${sheetName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_SHEETS_API_KEY}`
  
  const response = await fetch(url)
  const data: SheetData = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function writeSheet(sheetName: string, values: string[][], range: string) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!${range}?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function appendSheet(sheetName: string, values: string[][]) {
  const range = `${sheetName}!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: values
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${response.status}`)
  }

  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}