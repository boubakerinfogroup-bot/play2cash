# 🚀 Play to Cash - Complete Deployment Guide

## Simple, Direct Deployment - Full Control

This guide walks you through deploying the platform step-by-step with no abstractions.

---

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **Database**: PostgreSQL (Railway/Neon) or MySQL (PlanetScale)

---

## 1️⃣ Local Setup

### Step 1: Install Dependencies

```bash
cd next-version
npm install
```

### Step 2: Set Up Database

**Option A: Railway (PostgreSQL - Recommended)**
1. Go to [railway.app](https://railway.app)
2. Sign up/login
3. Click **"New Project"** → **"Provision PostgreSQL"**
4. Copy the connection string

**Option B: Neon (PostgreSQL)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up/login
3. Create a project
4. Copy the connection string

**Option C: PlanetScale (MySQL)**
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up/login
3. Create a database
4. Copy the connection string
5. Update `prisma/schema.prisma`: Change `provider = "mysql"`

### Step 3: Configure Environment

Create `.env.local`:

```env
# Database URL
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT Secret (generate random string)
JWT_SECRET="your-random-secret-key-here"

# Socket.io
SOCKET_IO_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Support WhatsApp
SUPPORT_WHATSAPP="+216XXXXXXXXX"
```

**Generate JWT Secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (games + admin account)
npm run db:seed
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

---

## 2️⃣ Database Setup Details

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Create migration (for production)
npm run db:migrate

# Open database GUI
npm run db:studio

# Seed database
npm run db:seed
```

### Verify Database

After running `db:push` and `db:seed`:

1. Check tables exist:
   ```bash
   npm run db:studio
   ```
   You should see: `users`, `games`, `matches`, `transactions`, etc.

2. Check games seeded:
   - Should see 6 games (Fast Math, Memory Grid, etc.)

3. Check admin account:
   - Username: `admin`
   - Password: `admin` (change in production!)

---

## 3️⃣ GitHub Setup

### Step 1: Initialize Git

```bash
cd next-version
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Name: `play2cash-next`
4. **Don't** initialize with README
5. Click **"Create repository"**

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/play2cash-next.git
git branch -M main
git push -u origin main
```

---

## 4️⃣ Vercel Deployment

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"New Project"**
4. Import your `play2cash-next` repository
5. Click **"Import"**

### Step 2: Configure Build Settings

Vercel auto-detects Next.js, but verify:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (or leave empty)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**:

Add these for **Production**, **Preview**, and **Development**:

```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
SOCKET_IO_URL=https://your-project.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
SUPPORT_WHATSAPP=+216XXXXXXXXX
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Vercel provides URL: `https://your-project.vercel.app`

### Step 5: Post-Deployment Setup

After deployment, run database migrations:

1. **Option A**: SSH into Vercel (if supported)
2. **Option B**: Run locally pointing to production DB:
   ```bash
   DATABASE_URL="your_production_db_url" npm run db:push
   DATABASE_URL="your_production_db_url" npm run db:seed
   ```
3. **Option C**: Use Prisma Studio remotely (not recommended for production)

**Recommended**: Use a migration tool or run migrations via CI/CD.

---

## 5️⃣ Socket.io Setup (Production)

### Option A: Same Server (Simple)

Socket.io runs on the same Vercel server. Works for small scale.

**No additional setup needed** - already configured in `lib/socket.ts`

### Option B: Separate Socket.io Server (Scalable)

For production at scale, run Socket.io on a separate server:

1. **Create separate Node.js server** (Railway/Heroku):
   ```javascript
   // socket-server.js
   const express = require('express')
   const { createServer } = require('http')
   const { Server } = require('socket.io')
   
   const app = express()
   const server = createServer(app)
   const io = new Server(server, {
     cors: { origin: 'https://your-project.vercel.app' }
   })
   
   // Copy socket logic from lib/socket.ts
   // ...
   
   server.listen(3001)
   ```

2. Update `SOCKET_IO_URL` in Vercel to point to socket server

**For now, Option A is fine** - upgrade later if needed.

---

## 6️⃣ Testing Checklist

### Authentication
- [ ] Register new user (name + WhatsApp + email)
- [ ] Login with existing WhatsApp (auto-login)
- [ ] Language switching works
- [ ] Session persists on refresh

### Database
- [ ] All tables created
- [ ] Games seeded (6 games)
- [ ] Admin account created (admin/admin)

### Match Flow
- [ ] Create match (stake locked)
- [ ] Join match (balance checked)
- [ ] Match becomes active (2 players)
- [ ] Countdown works (3, 2, 1)
- [ ] Game starts simultaneously
- [ ] Match resolution (winner determined)
- [ ] Platform fee calculated (5%)
- [ ] Balance updated correctly

### Real-time
- [ ] Socket.io connection works
- [ ] Heartbeat sent (every 3s)
- [ ] Opponent status checked (every 2s)
- [ ] Disconnect detection works
- [ ] Auto-win on disconnect

### Admin Panel
- [ ] Admin login works (`/admin/login`)
- [ ] Can view users
- [ ] Can approve deposits
- [ ] Can approve withdrawals
- [ ] Can view revenue stats

---

## 7️⃣ Environment Variables Reference

### Required

```env
DATABASE_URL="postgresql://..."  # Database connection string
JWT_SECRET="..."                  # Random secret for JWT tokens
```

### Optional

```env
SOCKET_IO_URL="..."              # Socket.io server URL (default: same origin)
NEXT_PUBLIC_SITE_URL="..."       # Your site URL
SUPPORT_WHATSAPP="+216..."       # Support WhatsApp number
```

---

## 8️⃣ Production Checklist

Before going live:

- [ ] Change admin password (hash in database)
- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Verify database backups enabled
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test all features in production
- [ ] Set up domain (optional)
- [ ] Enable HTTPS (automatic on Vercel)

---

## 9️⃣ Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server`

**Fix**:
1. Check `DATABASE_URL` in Vercel environment variables
2. Verify database is running (Railway/Neon dashboard)
3. Check firewall/network settings
4. Ensure connection string format is correct

### Migration Errors

**Error**: `Migration failed`

**Fix**:
```bash
# Reset database (DANGER: deletes all data)
npm run db:push -- --force-reset

# Or create new migration
npm run db:migrate -- --name init
```

### Socket.io Not Working

**Error**: `Socket connection failed`

**Fix**:
1. Check `SOCKET_IO_URL` in environment variables
2. Verify Socket.io server is running
3. Check CORS settings
4. Check browser console for errors

### Build Errors

**Error**: `Prisma Client not generated`

**Fix**:
```bash
npm run db:generate
```

---

## 🎉 You're Live!

After completing these steps, your platform is deployed and ready to use.

**Next Steps**:
1. Test all features
2. Change admin password
3. Monitor error logs
4. Set up backups
5. Start onboarding users!

---

**Need Help?** Check the logs:
- Vercel: Project → Deployments → View Function Logs
- Database: Railway/Neon/PlanetScale dashboard → Logs
- Browser: F12 → Console tab
