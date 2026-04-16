import fetch from 'node-fetch';

async function test() {
  const url = 'https://zhnlgwmheykzwhttmcur.supabase.co/functions/v1/gemini-proxy';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpobmxnd21oZXlrendodHRtY3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjgzODIsImV4cCI6MjA5MTM0NDM4Mn0.w0DY4vloFD8Quz3SEYUg21f7gtRvFbhU6iiymY_zDj4';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        contents: `You are a helpful assistant for a small WhatsApp seller. Write a short summary.`
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
