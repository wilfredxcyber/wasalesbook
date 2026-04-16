import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { model, contents, config } = await req.json();
    
    // Auth Check: Ensure the user is actually signed into your Supabase app
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not set' }), { status: 500, headers: corsHeaders });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Call Gemini using the GenAI SDK
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.0-flash',
      contents,
      config,
    });

    return new Response(
      JSON.stringify({ text: response.text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing request' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
