# 🚀 TeachAI Setup Guide

This guide will help you set up your development environment and get the TeachAI platform running locally.

## Prerequisites

Make sure you have the following installed:
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** - VS Code recommended

## Step 1: Create Required Accounts

You'll need accounts for these services:

### 1. Clerk (Authentication) - FREE
- Go to [clerk.com](https://clerk.com)
- Sign up for a free account
- Create a new application named "TeachAI"
- **Keep this tab open** - you'll need the API keys

### 2. Convex (Database) - FREE
- Go to [convex.dev](https://convex.dev)
- Sign up with GitHub
- **No setup needed yet** - we'll configure this later

### 3. OpenAI (AI Service) - $5-20/month
- Go to [platform.openai.com](https://platform.openai.com)
- Create account and add payment method
- Go to API Keys section
- Create new API key
- **Save this key securely**

### 4. Email Service (Choose One) - FREE tier available
**Option A: SendGrid (Recommended)**
- Go to [sendgrid.com](https://sendgrid.com)
- Sign up for free account
- Create API key

**Option B: Resend (Alternative)**
- Go to [resend.com](https://resend.com)
- Sign up for free account
- Create API key

## Step 2: Initialize Project

Open your terminal and run these commands:

```bash
# Create the Next.js project
npx create-next-app@latest teachai --typescript --tailwind --eslint --app --src-dir

# Navigate to project directory
cd teachai

# Install required dependencies
npm install @clerk/nextjs convex @hookform/resolvers react-hook-form zod lucide-react

# Install UI dependencies
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Install development dependencies
npm install -D @types/node prettier
```

## Step 3: Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
# ===== CLERK AUTHENTICATION =====
# Get these from: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# ===== CONVEX DATABASE =====
# Get these by running: npx convex dev (see step 4)
CONVEX_DEPLOYMENT=dev:your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your_deployment.convex.cloud

# ===== OPENAI API =====
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# ===== EMAIL SERVICE =====
# Choose ONE of the following:

# Option 1: SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Option 2: Resend
RESEND_API_KEY=re_your_resend_api_key_here

# ===== DEVELOPMENT SETTINGS =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### How to Get Clerk Keys:
1. In your Clerk dashboard, go to the project you created
2. Click on "API Keys" in the sidebar
3. Copy the "Publishable key" and "Secret key"
4. Paste them into your `.env.local` file

## Step 4: Initialize Convex Database

```bash
# Initialize Convex (this will open browser for authentication)
npx convex dev
```

This command will:
- Create a `convex/` folder in your project
- Start the Convex development server
- Give you the CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL values
- Add these to your `.env.local` file

## Step 5: Create Project Structure

```bash
# Create component directories
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/forms
mkdir -p src/lib

# Create auth route directories
mkdir -p src/app/\(auth\)
mkdir src/app/\(auth\)/sign-in
mkdir src/app/\(auth\)/sign-up

# Create Convex schema directory
mkdir convex/schema
mkdir convex/functions
```

## Step 6: Start Development

```bash
# Start the Next.js development server
npm run dev
```

Your app should be running at `http://localhost:3000`

Make sure you also keep the Convex dev server running:
```bash
# In a separate terminal
npx convex dev
```

## Step 7: Verify Setup

Test that everything is working:

1. **Next.js**: Visit `http://localhost:3000` - should see Next.js welcome page
2. **Environment**: Check that no env variable errors in console  
3. **Convex**: Should see Convex dashboard at the URL provided
4. **Clerk**: No authentication errors in browser console

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution**: Make sure all dependencies are installed
```bash
npm install
```

### Issue: Convex connection fails
**Solution**: 
1. Make sure `npx convex dev` is running
2. Check that CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL are correct in .env.local

### Issue: Clerk authentication not working
**Solution**:
1. Verify API keys are correct in .env.local
2. Make sure you're using the right environment (test/production)
3. Check Clerk dashboard for any configuration issues

### Issue: Build fails
**Solution**:
1. Check that all environment variables are set
2. Run `npm run build` to see specific error messages
3. Make sure TypeScript has no errors

## Next Steps

Once your setup is complete:

1. ✅ **Verify** all services are connected
2. ✅ **Commit** your initial setup to Git
3. ✅ **Start Phase 1** development from IMPLEMENTATION_PLAN.md
4. ✅ **Begin with** authentication setup

## Development Workflow

Your daily development routine:

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Convex
npx convex dev

# Your app runs at http://localhost:3000
# Convex dashboard available in browser
```

## Getting Help

- **Documentation**: See PROJECT_SPEC.md for detailed requirements
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Clerk**: [clerk.com/docs](https://clerk.com/docs)
- **Convex**: [docs.convex.dev](https://docs.convex.dev)
- **TailwindCSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)

**Ready to build?** Follow the IMPLEMENTATION_PLAN.md for your development roadmap! 