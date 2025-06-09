import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkRecentSessions() {
  const email = 'demo.dev.connect@gmail.com';
  
  console.log('\n=== Checking Recent Sessions and Auth Activity ===\n');
  
  // Get user from auth.users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }
  
  const authUser = users.find(u => u.email === email);
  
  if (authUser) {
    console.log('User ID:', authUser.id);
    console.log('Email:', authUser.email);
    console.log('Created at:', authUser.created_at);
    console.log('Last sign in at:', authUser.last_sign_in_at);
    console.log('Email confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
    
    // Calculate time since last sign in
    if (authUser.last_sign_in_at) {
      const lastSignIn = new Date(authUser.last_sign_in_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastSignIn.getTime();
      const minutesAgo = Math.floor(timeDiff / 1000 / 60);
      console.log(`\nLast sign in was ${minutesAgo} minutes ago`);
    }
    
    // Check if there might be any active sessions
    // Note: We can't directly query active sessions, but we can check the auth logs
    console.log('\nApp metadata:', JSON.stringify(authUser.app_metadata, null, 2));
    console.log('User metadata:', JSON.stringify(authUser.user_metadata, null, 2));
  } else {
    console.log('User not found in auth.users table');
  }
  
  // Also check if there are any recent auth logs (if available)
  console.log('\n=== Profile Status Check ===\n');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError);
  } else {
    console.log('Profile Status:', profile.status);
    console.log('Profile Role:', profile.role);
    console.log('Approved:', profile.approved_at ? `Yes (${profile.approved_at})` : 'No');
    
    // Check if profile matches auth user
    if (authUser && profile.id !== authUser.id) {
      console.warn('\n⚠️  WARNING: Profile ID does not match Auth User ID!');
      console.log('Profile ID:', profile.id);
      console.log('Auth User ID:', authUser.id);
    }
  }
}

checkRecentSessions().catch(console.error);