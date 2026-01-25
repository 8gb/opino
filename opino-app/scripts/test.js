require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log('URL:', process.env.SUPABASE_URL);
  console.log('Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
  
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('List users error:', error);
  } else {
    console.log('List users success, count:', data.users.length);
  }
}

test();