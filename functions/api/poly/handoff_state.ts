/**
 * Cloudflare Function to proxy PolyAI API requests
 * This keeps the API key secure on the server side
 */

interface Env {
  POLYAI_API_KEY: string;
  POLYAI_ACCOUNT_ID: string;
  POLYAI_BASE_URL?: string;
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    // Validate environment variables
    if (!env.POLYAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'POLYAI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!env.POLYAI_ACCOUNT_ID) {
      return new Response(
        JSON.stringify({ error: 'POLYAI_ACCOUNT_ID not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const sharedId = url.searchParams.get('sharedId');

    if (!projectId || !sharedId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: projectId, sharedId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build PolyAI API URL
    const baseUrl = env.POLYAI_BASE_URL || 'https://api.staging.us-1.platform.polyai.app';
    const polyApiUrl = `${baseUrl}/v1/${env.POLYAI_ACCOUNT_ID}/${projectId}/handoff_state?shared_id=${encodeURIComponent(sharedId)}`;

    console.log(`Fetching from PolyAI: ${polyApiUrl}`);

    // Call PolyAI API
    const polyResponse = await fetch(polyApiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': env.POLYAI_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const polyData = await polyResponse.json();

    if (!polyResponse.ok) {
      console.error(`PolyAI API error ${polyResponse.status}:`, polyData);
      return new Response(
        JSON.stringify({ error: 'PolyAI API error', details: polyData }),
        { 
          status: polyResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return successful response
    return new Response(JSON.stringify(polyData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
