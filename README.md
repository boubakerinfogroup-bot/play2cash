# 🎮 Play to Cash - Next.js Version

**Simple, Direct, Full Control** - No Supabase, No RLS, No Magic

Complete rebuild with Next.js, Prisma, Socket.io, and PostgreSQL/MySQL.

---

## ✅ What's Included

### Core Systems
- ✅ **Authentication**: No passwords (Name + WhatsApp + Email)
- ✅ **Wallet System**: Transactions, deposits, withdrawals (admin approval)
- ✅ **Match System**: Create, join, cancel, resolve (exact PHP behavior)
- ✅ **Real-time Sync**: Socket.io for game sync, countdown, disconnect detection
- ✅ **Platform Fee**: 5% automatic fee calculation
- ✅ **Database**: Prisma ORM with PostgreSQL/MySQL support

### Features
- ✅ Mobile-first UI (light theme, big buttons)
- ✅ RTL support (Arabic + French)
- ✅ Admin panel (separate login)
- ✅ Match cancellation (60-second timer)
- ✅ Disconnect handling (20-second grace period)
- ✅ Anti-cheat (server-authoritative, no refresh abuse)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Get a database from:
- **Railway**: [railway.app](https://railway.app) (PostgreSQL)
- **Neon**: [neon.tech](https://neon.tech) (PostgreSQL)
- **PlanetScale**: [planetscale.com](https://planetscale.com) (MySQL)

### 3. Configure Environment

Create `.env.local`:

```env
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_random_secret_key"
SOCKET_IO_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SUPPORT_WHATSAPP="+216XXXXXXXXX"
```

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database (games + admin)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

---

## 📁 Project Structure

```
next-version/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── (other pages)      # Other pages
├── lib/                   # Core logic
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # Authentication
│   ├── wallet.ts         # Wallet/transactions
│   ├── matches.ts        # Match logic
│   ├── socket.ts         # Socket.io server
│   └── utils.ts          # Utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed
└── components/           # React components
```

---

## 🗄️ Database

**Prisma ORM** - Simple, type-safe database access.

**Tables**:
- `users` - User accounts (no passwords)
- `games` - Available games (6 games)
- `matches` - Match instances
- `match_players` - Players in matches
- `transactions` - All financial transactions
- `deposit_requests` - Deposit requests
- `withdrawal_requests` - Withdrawal requests
- `platform_revenue` - 5% fee tracking
- `admin_accounts` - Admin login

**NO RLS, NO policies** - Direct SQL queries, full control.

---

## 🔌 Real-time (Socket.io)

**WebSocket-based real-time sync**:
- Game countdown (3, 2, 1)
- Simultaneous game start
- Heartbeat monitoring (every 3s)
- Disconnect detection (20s timeout)
- Opponent status checking

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture explanation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment steps
- **[AUDIT_AND_MIGRATION.md](./AUDIT_AND_MIGRATION.md)** - PHP behavior reference

---

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Open database GUI
npm run db:studio

# Seed database
npm run db:seed
```

---

## 🎯 Key Features

### Business Logic (Matches PHP Exactly)

1. **Match Creation**: Stake locked immediately
2. **Match Joining**: Race condition prevention (database transactions)
3. **Match Resolution**: Winner gets 95%, platform takes 5%
4. **Match Cancellation**: 60-second minimum wait, 10-minute auto-cancel
5. **Wallet**: All changes via atomic transactions
6. **Admin Approval**: Manual deposit/withdrawal approval

### Improvements Over PHP

1. **Real-time Sync**: WebSocket-based (vs polling)
2. **Type Safety**: TypeScript + Prisma
3. **Better Performance**: Direct database queries
4. **Easier Debugging**: Standard Node.js stack
5. **Scalability**: Socket.io scales better than polling

---

## 🚢 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- GitHub setup
- Vercel deployment
- Database configuration
- Environment variables
- Production checklist

---

## 🔐 Security

- **JWT tokens** for sessions
- **bcrypt** for admin passwords
- **Input validation** via Zod
- **SQL injection protection** via Prisma
- **CORS** configured for Socket.io

---

## 📞 Support

For issues:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review database logs (Railway/Neon/PlanetScale dashboard)
3. Check Vercel function logs
4. Review browser console (F12)

---

**Built with full control and zero abstractions. 🚀**
