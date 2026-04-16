import { createClient } from '@supabase/supabase-js';

const url = 'https://zhnlgwmheykzwhttmcur.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpobmxnd21oZXlrendodHRtY3VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjgzODIsImV4cCI6MjA5MTM0NDM4Mn0.w0DY4vloFD8Quz3SEYUg21f7gtRvFbhU6iiymY_zDj4';

const supabase = createClient(url, key);

async function testRecovery() {
  const email = 'wilfredjonathan14@gmail.com';
  console.log('Requesting password reset for', email);
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    console.error('Error requesting reset:', error.message);
  } else {
    console.log('Reset requested successfully. Code sent to email.');
  }
}

testRecovery();
