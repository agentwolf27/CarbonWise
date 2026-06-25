# 🗄️ Supabase Setup Guide for CarbonWise

This guide will help you set up Supabase as your database and real-time backend for CarbonWise.

## 🚀 Step 1: Create Supabase Project

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com)
   - Sign up using GitHub (recommended) or email

2. **Create a New Project**
   - Click "New Project"
   - Select your organization (create one if needed)
   - Fill in project details:
     - **Project Name**: `CarbonWise`
     - **Database Password**: Generate a strong password (save it!)
     - **Region**: Choose closest to your users (e.g., US West, EU West)
     - **Pricing Plan**: Start with Free tier

3. **Wait for Setup** (usually takes 2-3 minutes)

## 🛠️ Step 2: Configure Database Schema

1. **Open SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Create a new query

2. **Run the Schema Setup**
   - Copy the contents of `supabase-schema.sql` (created during setup)
   - Paste and execute the SQL script
   - This will create all necessary tables, indexes, and security policies

## 🔧 Step 3: Configure Environment Variables

1. **Get Your Project Credentials**
   - Go to Project Settings → API
   - Copy your:
     - `Project URL` (looks like: https://xxxx.supabase.co)
     - `Public anon key` (starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
     - `Service role key` (starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

2. **Update Your Environment File**
   ```bash
   # Create .env.local file in your project root
   cp .env.example .env.local
   ```

   Add these variables to `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Keep your other existing variables
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   # ... etc
   ```

## 🔐 Step 4: Configure Row Level Security (RLS)

The schema script automatically sets up RLS policies, but here's what it does:

1. **Enable RLS on all tables**
2. **Create policies for user data isolation**:
   - Users can only see their own activities
   - Users can only manage their own goals
   - Users can only view their own achievements

## 🔄 Step 5: Enable Real-time Features

1. **Go to Database → Replication**
2. **Enable replication for these tables**:
   - `carbon_activities`
   - `goals` 
   - `achievements`

3. **Configure real-time subscriptions** (already done in code):
   - Activities get real-time updates when added via extension
   - Dashboard shows live updates without refresh

## 📱 Step 6: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Sign up for a new account**:
   - Go to http://localhost:3000/auth/signup
   - Create a test account

3. **Verify database connection**:
   - Check Supabase dashboard → Table Editor
   - You should see your user data in the `users` table

4. **Test activity creation**:
   - Use the Chrome extension or dashboard
   - Verify activities appear in `carbon_activities` table

## 🎯 Step 7: Migrate from Prisma (Optional)

If you're migrating from Prisma:

1. **Export existing data**:
   ```bash
   # Create a backup script or use Prisma's data export
   npx prisma db pull
   npx prisma generate
   ```

2. **Transform and import to Supabase**:
   - Use the Supabase dashboard or write a migration script
   - Match the schema structure defined in `supabase-schema.sql`

3. **Update imports in your code**:
   - Replace `import { prisma }` with `import { supabase }`
   - Update all database queries to use Supabase client

## 🚀 Step 8: Deploy to Production

1. **Create Production Project**:
   - Create another Supabase project for production
   - Use the same schema setup

2. **Update Environment Variables**:
   - Set production URLs and keys in your deployment platform
   - Use different projects for staging/production

3. **Configure Custom Domain** (optional):
   - In Supabase dashboard → Settings → API
   - Set up custom domain for your API

## 🔍 Monitoring and Analytics

1. **Enable Analytics**:
   - Go to Reports in Supabase dashboard
   - Monitor database performance and usage

2. **Set up Alerts**:
   - Configure alerts for high usage or errors
   - Monitor real-time connection counts

## 🛡️ Security Best Practices

1. **Environment Variables**:
   - Never commit `.env.local` to git
   - Use different keys for development/production

2. **RLS Policies**:
   - Review and test all RLS policies
   - Ensure users can only access their own data

3. **API Keys**:
   - Use anon key for client-side operations
   - Use service role key only for server-side operations
   - Rotate keys periodically

## 🆘 Troubleshooting

### Common Issues:

1. **Connection Errors**:
   ```
   Error: Invalid API URL or key
   ```
   - Verify your environment variables
   - Check if URLs have trailing slashes (remove them)

2. **RLS Policy Errors**:
   ```
   Error: Row level security policy violation
   ```
   - Check if user is properly authenticated
   - Verify RLS policies allow the operation

3. **Real-time Not Working**:
   - Enable replication for the table
   - Check if real-time is enabled for your plan
   - Verify WebSocket connections aren't blocked

### Getting Help:

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord Community](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)

## 📊 Benefits of Supabase for CarbonWise

✅ **Real-time Updates**: Activities appear instantly across all connected clients
✅ **Scalable**: Handles millions of carbon activities efficiently  
✅ **Secure**: Built-in RLS and authentication
✅ **Developer Friendly**: SQL-based with excellent TypeScript support
✅ **Cost Effective**: Generous free tier, pay-as-you-scale pricing
✅ **PostgreSQL**: Full-featured SQL database with JSON support
✅ **Global CDN**: Fast response times worldwide

## 🎉 You're All Set!

Your CarbonWise application is now powered by Supabase! You get:

- ⚡ Real-time carbon activity tracking
- 🔒 Secure user data isolation
- 📈 Scalable database infrastructure
- 🌍 Global performance
- 💰 Cost-effective scaling

Start tracking carbon footprints with confidence! 🌱 