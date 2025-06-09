import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthFlow() {
  const email = 'demo.dev.connect@gmail.com';
  
  console.log('\n=== Testing Authentication Flow ===\n');
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
  } else {
    console.log('Current session:', session ? 'Active' : 'None');
    if (session) {
      console.log('Session user:', session.user.email);
      console.log('Session expires at:', new Date(session.expires_at! * 1000).toISOString());
    }
  }
  
  // Try to get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error('Error getting user:', userError);
  } else {
    console.log('\nCurrent auth user:', user ? user.email : 'None');
  }
  
  // If user is authenticated, check their profile
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error getting profile:', profileError);
    } else {
      console.log('\nProfile status:', profile.status);
      console.log('Profile role:', profile.role);
      console.log('Profile approved at:', profile.approved_at);
    }
  }
}

testAuthFlow().catch(console.error);