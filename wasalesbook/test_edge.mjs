import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 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`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: "user", content: "hello" }]
      })
    });
    
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}

test();
