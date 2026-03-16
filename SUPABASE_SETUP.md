# Database Setup for DumbMoney.Ltd

## Current Setup (Local Development)
- **Database**: SQLite (file: `db/custom.db`)
- **Data persists**: ✅ Yes, locally on this machine
- **Works on Vercel**: ❌ No (SQLite files don't persist on Vercel)

---

## Setup Free Cloud Database (Supabase) for Vercel

### Step 1: Create Supabase Account (FREE)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Create a new organization if prompted

### Step 2: Create New Project
1. Click "New Project"
2. Name it: `dumbmoney`
3. Set a strong database password (save it!)
4. Choose a region close to you
5. Click "Create new project" (wait ~2 minutes)

### Step 3: Get Database Connection String
1. Go to: Project Settings → Database
2. Scroll to "Connection string" section
3. Copy the **URI** connection string
4. Replace `[YOUR-PASSWORD]` with the password you set

Example:
```
postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
```

### Step 4: Update Prisma Schema for PostgreSQL
Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")  // Add this for Supabase
}
```

### Step 5: Set Environment Variables on Vercel
1. Go to your Vercel project dashboard
2. Click: Settings → Environment Variables
3. Add these variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string (with pooler: port 6543) |
| `DIRECT_DATABASE_URL` | Same connection string but change port to 5432 |

Example:
```
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
DIRECT_DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

### Step 6: Deploy
1. Push your changes to GitHub
2. Vercel will auto-deploy
3. Done! Your data now persists in the cloud! 🎉

---

## Free Tier Limits (Supabase)
- **Database size**: 500 MB
- **Bandwidth**: 5 GB/month
- **API requests**: Unlimited
- **Perfect for**: Personal finance apps, small projects

---

## Alternative: Neon (Another Free PostgreSQL)
If Supabase doesn't work for you, try Neon:
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string
5. Same steps as above

Neon Free Tier:
- **Database size**: 512 MB
- **Compute**: 191 hours/month
- **Perfect for**: Serverless apps like Vercel

---

## Quick Switch Commands

### Local Development (SQLite)
```bash
# Already configured - just run:
bun run dev
```

### Production (Supabase)
1. Update `prisma/schema.prisma` provider to `postgresql`
2. Add `DIRECT_DATABASE_URL` line
3. Set environment variables in Vercel
4. Push and deploy
