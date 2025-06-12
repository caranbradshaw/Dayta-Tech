/**
 * Supabase Setup Helper
 *
 * This utility helps with setting up Supabase and checking its status.
 * It's designed to be used on the client-side to guide users through setup.
 */

// Function to check if Supabase environment variables are set
export function checkSupabaseEnvVars(): {
  hasRequiredVars: boolean
  missingVars: string[]
  presentVars: string[]
} {
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const optionalVars = ["SUPABASE_SERVICE_ROLE_KEY", "POSTGRES_URL", "DATABASE_URL"]

  const missingVars: string[] = []
  const presentVars: string[] = []

  // Check required vars
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    } else {
      presentVars.push(varName)
    }
  })

  // Check optional vars
  optionalVars.forEach((varName) => {
    if (process.env[varName]) {
      presentVars.push(varName)
    }
  })

  return {
    hasRequiredVars: missingVars.length === 0,
    missingVars,
    presentVars,
  }
}

// Function to generate a .env.local template
export function generateEnvTemplate(): string {
  return `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database URLs (Supabase provides these)
POSTGRES_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your-database-password"
POSTGRES_HOST="db.your-project-ref.supabase.co"

# Optional: AI Services (for real AI analysis)
# OPENAI_API_KEY="your-openai-key"
# CLAUDE_API_KEY="your-claude-key"
# GROQ_API_KEY="your-groq-key"

# Optional: File Storage (for persistent file storage)
# BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Optional: Email Services (for notifications)
# SENDGRID_API_KEY="your-sendgrid-key"
# FROM_EMAIL="noreply@yourdomain.com"
`
}

// Function to check if we're in development mode
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

// Function to get Supabase setup instructions
export function getSetupInstructions(): string {
  return `
# Supabase Setup Instructions

## 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Choose a name, database password, and region

## 2. Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → \`NEXT_PUBLIC_SUPABASE_URL\`
   - **anon public** key → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - **service_role** key → \`SUPABASE_SERVICE_ROLE_KEY\`

## 3. Get Database Connection Details
1. In Supabase dashboard, go to **Settings** → **Database**
2. Copy the connection string and extract:
   - Host, password, etc. for the POSTGRES_* variables

## 4. Add Environment Variables
1. Create a \`.env.local\` file in your project root
2. Add the variables from steps 2 and 3
3. Restart your development server

## 5. Run Auto Setup
1. Visit \`/supabase-setup\` in your app
2. Click "Run Auto Setup" to create all necessary tables
`
}
