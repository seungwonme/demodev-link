# Admin Account Setup Guide

This guide provides comprehensive instructions for setting up the first admin account in your DemoLink instance. There are three methods available, each suited for different scenarios.

## Prerequisites

Before setting up an admin account, ensure you have:

1. **Supabase Project**: A configured Supabase project with the database migrations applied
2. **Environment Variables**: The following variables set in your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (required for admin operations)

## Method A: SQL Script Method

This method is ideal for direct database access and when you need quick setup without running the application.

### Steps:

1. **Access Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Create a new query

2. **Create Admin User**
   ```sql
   -- Replace these values with your desired admin credentials
   DO $$
   DECLARE
     admin_email TEXT := 'admin@yourdomain.com';
     admin_id UUID;
   BEGIN
     -- Create user in auth.users (requires service role access)
     -- Note: You'll need to create the user through Supabase Auth UI or API first
     
     -- Get the user ID
     SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
     
     -- Update the profile to admin status
     UPDATE profiles 
     SET 
       role = 'admin'::user_role,
       status = 'approved'::user_status,
       approved_at = NOW(),
       updated_at = NOW()
     WHERE id = admin_id;
     
     -- Verify the update
     RAISE NOTICE 'Admin user % has been created/updated successfully', admin_email;
   END $$;
   ```

3. **Alternative: Direct Profile Update**
   If you've already created a user through the signup flow:
   ```sql
   -- Update existing user to admin
   UPDATE profiles 
   SET 
     role = 'admin'::user_role,
     status = 'approved'::user_status,
     approved_at = NOW(),
     updated_at = NOW()
   WHERE email = 'your-email@domain.com';
   ```

4. **Verify Admin Creation**
   ```sql
   -- Check all admin users
   SELECT id, email, role, status, created_at, approved_at 
   FROM profiles 
   WHERE role = 'admin' AND status = 'approved';
   ```

## Method B: Seed Script Method

This method provides an interactive command-line interface for creating admin accounts.

### Setup:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Seed Script**
   ```bash
   npm run seed:admin
   ```

3. **Follow the Interactive Prompts**
   - Enter the admin email address
   - Create a secure password (minimum 6 characters)
   - Confirm the password

4. **Script Features**
   - Validates email format
   - Enforces password requirements
   - Checks for existing admin accounts
   - Provides clear success/error messages
   - Automatically sets role to 'admin' and status to 'approved'

### Running with Environment Variables

If you haven't set up `.env.local`, you can pass environment variables directly:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-url SUPABASE_SERVICE_ROLE_KEY=your-key npm run seed:admin
```

## Method C: Environment Variable Method

This method automatically promotes a specific email to admin on first registration.

### Implementation:

1. **Set Environment Variable**
   Add to your `.env.local`:
   ```env
   INITIAL_ADMIN_EMAIL=admin@yourdomain.com
   ```

2. **Add Auto-Promotion Logic**
   Create or update `src/features/auth/actions/auth.ts`:

   ```typescript
   export async function signUp(formData: FormData) {
     const supabase = await createClient();
     const email = formData.get('email') as string;
     const password = formData.get('password') as string;

     const { data, error } = await supabase.auth.signUp({
       email,
       password,
     });

     if (!error && data.user) {
       // Check if this is the initial admin
       const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
       
       if (email === initialAdminEmail) {
         // Auto-approve and make admin
         const { error: updateError } = await supabase
           .from('profiles')
           .update({
             role: 'admin',
             status: 'approved',
             approved_at: new Date().toISOString(),
           })
           .eq('id', data.user.id);

         if (updateError) {
           console.error('Failed to promote initial admin:', updateError);
         }
       }
     }

     return { data, error };
   }
   ```

3. **First Registration**
   - Register with the email specified in `INITIAL_ADMIN_EMAIL`
   - The account will automatically be approved with admin privileges

## Security Considerations

### 1. Service Role Key Protection
- **Never expose** the `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Keep it only in server-side environment variables
- Use it only for administrative operations

### 2. Admin Account Security
- Use strong, unique passwords for admin accounts
- Enable two-factor authentication if available
- Regularly audit admin accounts
- Remove unused admin privileges

### 3. Verification Commands

**Check All Admin Users:**
```sql
SELECT 
  p.id,
  p.email,
  p.role,
  p.status,
  p.created_at,
  p.approved_at,
  p.approved_by
FROM profiles p
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;
```

**Audit User Permissions:**
```sql
-- View all approved users with their roles
SELECT 
  email,
  role,
  status,
  approved_at,
  CASE 
    WHEN approved_by IS NOT NULL THEN 
      (SELECT email FROM profiles WHERE id = p.approved_by)
    ELSE NULL
  END as approved_by_email
FROM profiles p
WHERE status = 'approved'
ORDER BY role, created_at;
```

**Remove Admin Privileges:**
```sql
-- Downgrade admin to regular user
UPDATE profiles 
SET 
  role = 'user'::user_role,
  updated_at = NOW()
WHERE email = 'user-to-downgrade@domain.com' 
  AND role = 'admin';
```

### 4. Best Practices

1. **First Admin Only**: Use these methods only for the initial admin setup
2. **Subsequent Admins**: Create through the admin dashboard UI
3. **Audit Trail**: All admin actions are logged with timestamps
4. **Regular Reviews**: Periodically review admin accounts
5. **Principle of Least Privilege**: Only grant admin access when necessary

## Troubleshooting

### Common Issues:

1. **"Missing required environment variables"**
   - Ensure `.env.local` contains all required Supabase credentials
   - Check that environment variables are properly loaded

2. **"Error creating user: Email already exists"**
   - User with this email already exists
   - Use SQL method to update existing user to admin

3. **"Error updating user profile"**
   - Check database migrations are applied
   - Ensure enum types are created
   - Verify RLS policies allow the operation

4. **"Cannot find profiles table"**
   - Run database migrations: `npm run db:push`
   - Check Supabase connection settings

### Getting Help

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify all migrations have been applied
3. Ensure RLS policies are correctly configured
4. Review the [project documentation](../README.md)

## Next Steps

After creating your first admin account:

1. **Log in** at `/admin/login`
2. **Access Admin Dashboard** at `/admin/dashboard`
3. **Manage Users** at `/admin/users`
4. **Create Additional Admins** through the user management interface
5. **Configure** your URL shortener settings

Remember to change the default admin password after first login for security!