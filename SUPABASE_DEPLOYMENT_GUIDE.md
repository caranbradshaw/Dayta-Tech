# Complete Supabase Deployment Guide for DaytaTech SaaS

## 🚀 Step-by-Step Deployment Instructions

### 1. Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Fill in project details:**
   - Organization: Select or create
   - Name: `daytatech-saas` (or your preferred name)
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
5. **Click "Create new project"**
6. **Wait 2-3 minutes** for project setup

### 2. Get Your API Keys & URLs

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   \`\`\`
   Project URL: https://your-project-ref.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   \`\`\`

3. **Go to Settings → Database**
4. **Copy the connection string:**
   \`\`\`
   postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
   \`\`\`

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Database URLs
POSTGRES_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-database-password"
POSTGRES_HOST="db.your-project-ref.supabase.co"

# Optional: AI Services (for real AI analysis)
OPENAI_API_KEY="your-openai-key"
CLAUDE_API_KEY="your-claude-key"
GROQ_API_KEY="your-groq-key"

# Optional: File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Optional: Email Services
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yourdomain.com"
\`\`\`

### 4. Set Up Database Tables

**Option A: Use the Auto-Setup (Recommended)**
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/supabase-setup`
3. Click "Run Auto Setup"
4. Wait for all tables to be created

**Option B: Manual SQL Execution**
1. Go to your Supabase dashboard
2. Click "SQL Editor"
3. Run these scripts in order:
   - `scripts/01-create-profiles-table.sql`
   - `scripts/02-create-organizations-table.sql`
   - `scripts/03-create-projects-table.sql`
   - `scripts/04-create-analyses-table.sql`
   - `scripts/05-create-insights-table.sql`
   - `scripts/06-create-subscriptions-table.sql`
   - `scripts/07-create-activity-tables.sql`
   - `scripts/08-create-admin-tables.sql`
   - `scripts/09-create-functions.sql`
   - `scripts/10-seed-sample-data.sql`
   - `scripts/supabase-rls-policies.sql`

### 5. Configure Row Level Security (RLS)

1. **In Supabase dashboard, go to Authentication → Settings**
2. **Enable these settings:**
   - Enable email confirmations: ✅
   - Enable phone confirmations: ❌ (unless needed)
   - Enable custom SMTP: ❌ (use Supabase's SMTP initially)

3. **Go to Database → Tables**
4. **For each table, click the table name → RLS**
5. **Verify RLS is enabled** (should be ✅ if you ran the policies script)

### 6. Set Up Authentication

1. **Go to Authentication → Settings**
2. **Configure Site URL:**
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

3. **Add Redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

4. **Email Templates (optional):**
   - Customize confirmation and reset password emails
   - Add your branding and styling

### 7. Test Your Setup

1. **Start your development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Visit these pages to test:**
   - `http://localhost:3000/health` - System health check
   - `http://localhost:3000/supabase-setup` - Database setup status
   - `http://localhost:3000/signup` - User registration
   - `http://localhost:3000/login` - User login

3. **Create a test account:**
   - Sign up with a real email address
   - Check your email for confirmation
   - Log in and test file upload

### 8. Deploy to Production

**For Vercel Deployment:**

1. **Push your code to GitHub**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add all environment variables from `.env.local`

3. **Update Supabase settings:**
   - Add your production URL to Site URL
   - Add production redirect URLs
   - Update CORS settings if needed

**For other platforms:**
- Ensure all environment variables are set
- Update Supabase Site URL and redirect URLs
- Test authentication flow in production

### 9. Production Checklist

- [ ] All environment variables configured
- [ ] Database tables created successfully
- [ ] RLS policies enabled and tested
- [ ] Authentication working (signup/login)
- [ ] File upload and analysis working
- [ ] Email confirmations working
- [ ] SSL certificate configured
- [ ] Domain configured correctly
- [ ] Error monitoring set up (optional)
- [ ] Analytics tracking working (optional)

### 10. Monitoring & Maintenance

1. **Monitor your Supabase dashboard:**
   - Database usage
   - API requests
   - Authentication metrics
   - Storage usage

2. **Set up alerts:**
   - Database size limits
   - API rate limits
   - Error rates

3. **Regular backups:**
   - Supabase provides automatic backups
   - Consider additional backup strategies for critical data

## 🔧 Troubleshooting

### Common Issues:

**"Invalid API key" errors:**
- Double-check your environment variables
- Ensure no extra spaces or quotes
- Restart your development server

**Database connection errors:**
- Verify your database password
- Check if your IP is allowed (Supabase allows all by default)
- Ensure the connection string is correct

**RLS policy errors:**
- Check if RLS is enabled on tables
- Verify policies are created correctly
- Test with different user roles

**Authentication not working:**
- Check Site URL and redirect URLs
- Verify email confirmation settings
- Check browser console for errors

### Getting Help:

1. **Check the Supabase docs:** [supabase.com/docs](https://supabase.com/docs)
2. **Visit the Supabase community:** [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Use the built-in debugging tools:**
   - `/health` - System health check
   - `/supabase-setup` - Database setup status
   - `/env-status` - Environment variable check

## 🎉 Success!

Once everything is working:
- Your users can sign up and log in
- File uploads and AI analysis work
- Data is properly secured with RLS
- Your app is ready for production use!

Remember to monitor your usage and upgrade your Supabase plan as needed.
