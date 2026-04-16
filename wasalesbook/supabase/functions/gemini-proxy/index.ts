import "jsr:@supabase/functions-js/edge-runtime.d.ts"

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
    
    // Auth Check: Ensure the user is authenticated in Supabase
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set' }), { status: 500, headers: corsHeaders });
    }

    // Convert Gemini frontend format to OpenAI format
    let finalContent = [];
    if (typeof contents === 'string') {
      finalContent.push({ type: "text", text: contents });
    } else if (Array.isArray(contents)) {
      for (const item of contents) {
        if (typeof item === 'string') {
          finalContent.push({ type: "text", text: item });
        } else if (item.inlineData) {
          finalContent.push({ 
            type: "image_url", 
            image_url: { url: `data:${item.inlineData.mimeType};base64,${item.inlineData.data}` } 
          });
        }
      }
    }

    // Default to the fast and intelligent gpt-4o-mini which supports images
    const openaiPayload: any = {
      model: 'gpt-4o-mini', 
      messages: [{ role: "user", content: finalContent }],
    };

    // If frontend requested a specific JSON Schema extraction map it to OpenAI
    if (config?.responseSchema) {
       const schema = config.responseSchema;
       const properties = schema.properties || {};
       
       // Force strict JSON type mapping
       const openAiSchema: any = {
          type: "object",
          properties: {},
          additionalProperties: false,
          required: Object.keys(properties)
       };
       
       Object.entries(properties).forEach(([key, val]: [string, any]) => {
          openAiSchema.properties[key] = {
             type: val.type ? val.type.toLowerCase() : "string",
             description: val.description || ""
          };
       });

       openaiPayload.response_format = {
         type: "json_schema",
         json_schema: {
           name: "OrderExtraction",
           strict: true,
           schema: openAiSchema
         }
       };
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(openaiPayload)
    });

    if (!response.ok) {
       const errResponse = await response.text();
       throw new Error(`OpenAI Error: ${errResponse}`);
    }

    const openAiData = await response.json();
    const textOutput = openAiData.choices[0]?.message?.content || '{}';

    return new Response(
      JSON.stringify({ text: textOutput }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing request' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
