import { createClient } from '@supabase/supabase-js';

const url = 'https://zhnlgwmheykzwhttmcur.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpobmxnd21oZXlrendodHRtY3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjgzODIsImV4cCI6MjA5MTM0NDM4Mn0.w0DY4vloFD8Quz3SEYUg21f7gtRvFbhU6iiymY_zDj4';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing signup with a random email...');
  const testEmail = `test_${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
  });
  
  if (error) {
    console.error('SIGNUP ERROR:', error.message);
  } else {
    console.log('SIGNUP SUCCESS!');
  }
  console.log('DATA:', JSON.stringify(data, null, 2));
}

test();
