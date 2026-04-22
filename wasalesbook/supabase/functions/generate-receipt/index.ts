import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'image/png',
};

interface ReceiptData {
  order: {
    id: string;
    customerName: string;
    product: string;
    amount: number;
    paymentStatus: string;
    deliveryStatus: string;
    phone?: string;
    notes?: string;
    createdAt: string;
  };
  profile: {
    userName: string;
    currencySymbol: string;
    logoUrl?: string;
  };
  theme?: any;
  font?: any;
}

// Generate a simple PNG image on the server side
// Using a lightweight approach to create receipt as HTML then convert to PNG
async function generateReceiptImage(data: ReceiptData): Promise<Uint8Array> {
  // For server-side image generation, we'll use a service like html2pdf via an external API
  // OR we can use a library that works in Deno
  
  // Alternative: Return a data URL that can be handled by client, or use an external service
  // Let's use a simple approach - create an SVG which is universally supported
  
  const { order, profile, theme = {}, font = {} } = data;
  
  const currency = profile.currencySymbol || '₦';
  const amount = `${currency}${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const businessName = profile.userName || 'Whatsbook';
  
  // Create SVG receipt
  const svgContent = `
    <svg width="360" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          text { font-family: Arial, sans-serif; }
          .header { font-size: 16px; font-weight: bold; color: #006d2f; }
          .amount { font-size: 36px; font-weight: bold; color: #006d2f; }
          .label { font-size: 11px; color: #94a3b8; font-weight: 600; }
          .value { font-size: 12px; color: #1e293b; font-weight: 700; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="360" height="600" fill="#ffffff"/>
      
      <!-- Top bar -->
      <rect width="360" height="6" fill="#006d2f"/>
      
      <!-- Logo area -->
      <circle cx="180" cy="50" r="28" fill="#006d2f"/>
      <text x="180" y="58" text-anchor="middle" fill="white" font-size="24" font-weight="bold">
        ${businessName.charAt(0).toUpperCase()}
      </text>
      
      <!-- Business name -->
      <text x="180" y="100" text-anchor="middle" class="header">
        ${businessName}
      </text>
      <text x="180" y="115" text-anchor="middle" class="label">
        PAYMENT RECEIPT
      </text>
      
      <!-- Divider -->
      <line x1="40" y1="135" x2="320" y2="135" stroke="#e2e8e6" stroke-width="1"/>
      
      <!-- Amount section -->
      <text x="180" y="160" text-anchor="middle" class="label">TOTAL AMOUNT</text>
      <text x="180" y="200" text-anchor="middle" class="amount">${amount}</text>
      
      <!-- Status badge -->
      <rect x="120" y="215" width="120" height="25" rx="12" fill="${order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef2f2'}"/>
      <text x="180" y="235" text-anchor="middle" font-size="10" font-weight="bold" 
            fill="${order.paymentStatus === 'Paid' ? '#166534' : '#991b1b'}">
        ${order.paymentStatus}
      </text>
      
      <!-- Details -->
      <rect x="40" y="260" width="280" height="180" rx="8" fill="#f1f5f3"/>
      
      <text x="55" y="280" class="label">CUSTOMER:</text>
      <text x="55" y="295" class="value">${order.customerName}</text>
      
      <text x="55" y="320" class="label">PRODUCT:</text>
      <text x="55" y="335" class="value">${order.product}</text>
      
      <text x="55" y="360" class="label">DATE:</text>
      <text x="55" y="375" class="value">${new Date(order.createdAt).toLocaleString()}</text>
      
      <text x="55" y="400" class="label">DELIVERY:</text>
      <text x="55" y="415" class="value">${order.deliveryStatus}</text>
      
      <text x="55" y="440" class="label">REFERENCE:</text>
      <text x="55" y="455" class="value">${order.id}</text>
      
      <!-- Footer -->
      <text x="180" y="560" text-anchor="middle" font-size="9" fill="#94a3b8">
        Thank you for your purchase ❤️
      </text>
      <text x="180" y="580" text-anchor="middle" font-size="8" fill="#cbd5e1">
        Powered by Whatsbook
      </text>
    </svg>
  `;
  
  // For now, return the SVG as-is (can be viewed as image/svg+xml)
  // Later, this can be converted to PNG using a Deno library or external service
  return new TextEncoder().encode(svgContent);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const receiptData: ReceiptData = await req.json();

    // Validate required fields
    if (!receiptData.order || !receiptData.profile) {
      return new Response(JSON.stringify({ error: 'Missing order or profile data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate the receipt image
    const svgBuffer = await generateReceiptImage(receiptData);

    // Return as SVG
    return new Response(svgBuffer, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `inline; filename="receipt_${receiptData.order.id}.svg"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate receipt', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
