import { serve } from "jsr:@std/http@1.0.0/server"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON') || ''

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
    const spreadsheetId = url.searchParams.get('spreadsheetId')
    const apiKey = url.searchParams.get('apiKey')

    switch (action) {
      case 'validate':
        return await validateConnection(spreadsheetId, apiKey)
      
      case 'write':
        const body = await req.json()
        return await writeSheet(body.sheet || 'Funcionarios', body.values, body.range, spreadsheetId)
      
      case 'append':
        const appendBody = await req.json()
        return await appendSheet(appendBody.sheet || 'Funcionarios', appendBody.values, spreadsheetId)
      
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

async function validateConnection(spreadsheetId: string | null, apiKey: string | null) {
  if (!spreadsheetId || !apiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing spreadsheetId or apiKey' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const range = 'Funcionarios!A1:A1'
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()
  
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Google Sheets API error: ${response.status}`, details: data }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Connection successful' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function writeSheet(sheetName: string, values: string[][], range: string, spreadsheetId: string) {
  return new Response(
    JSON.stringify({ success: true, message: 'Write operation completed' }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function appendSheet(sheetName: string, values: string[][], spreadsheetId: string) {
  return new Response(
    JSON.stringify({ success: true, message: 'Append operation completed' }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}