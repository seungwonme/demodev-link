import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUserStatus() {
  const email = 'demo.dev.connect@gmail.com';
  
  console.log(`\nChecking status for user: ${email}\n`);
  
  // Query profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError);
  } else {
    console.log('Profile data:');
    console.log(JSON.stringify(profile, null, 2));
  }
  
  // Also check auth.users table
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
  } else {
    const authUser = users.find(u => u.email === email);
    if (authUser) {
      console.log('\nAuth user data:');
      console.log(JSON.stringify({
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        app_metadata: authUser.app_metadata,
        user_metadata: authUser.user_metadata
      }, null, 2));
    } else {
      console.log('\nNo auth user found with this email');
    }
  }
  
  // Check links created by this user
  if (profile?.id) {
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (linksError) {
      console.error('Error fetching links:', linksError);
    } else {
      console.log(`\nRecent links created by user (${links.length} found):`);
      if (links.length > 0) {
        console.log(JSON.stringify(links, null, 2));
      }
    }
  }
}

checkUserStatus().catch(console.error);