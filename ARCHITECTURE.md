# 🏗️ Play to Cash - Architecture

## Simple, Direct, Full Control

This architecture removes all abstractions and gives you complete control over auth, wallets, matches, and timing.

---

## 📦 Stack Components

### Frontend (Next.js App Router)
- **Pages**: Server and client components
- **Styling**: CSS modules (light theme, mobile-first)
- **State**: React hooks + Server Actions
- **Real-time**: Socket.io client

### Backend (Next.js API Routes + Server Actions)
- **API Routes**: `/api/*` for HTTP endpoints
- **Server Actions**: For form submissions and mutations
- **WebSocket Server**: Socket.io for real-time game sync
- **Database**: Prisma ORM → PostgreSQL/MySQL

### Database
- **ORM**: Prisma (type-safe, simple queries)
- **Database**: PostgreSQL (recommended) or MySQL
- **Hosting**: Railway, Neon, or PlanetScale
- **NO RLS**: Direct SQL queries, full control

---

## 🔄 Request Flow

### Page Load
```
User → Next.js Page → Server Component → Prisma → Database
                                    ↓
                            Render HTML + Data
```

### Form Submission (Server Action)
```
User submits form → Server Action → Prisma → Database
                                ↓
                        Redirect/Response
```

### Real-time Events (Socket.io)
```
User action → Socket.io Client → Socket.io Server → Prisma → Database
                                                   ↓
                                        Emit to other players
```

---

## 🔐 Authentication

**NO passwords, NO Supabase Auth**

1. User enters: Name + WhatsApp + Email
2. Check if WhatsApp exists in database
3. **If exists**: Create session cookie → Login
4. **If not**: Create user → Create session cookie → Login

**Session Management**:
- Simple JWT or session cookie
- Stored in `cookies()` (Next.js)
- User ID in every request
- No magic, no auth providers

---

## 💰 Wallet System

**Full Control, Manual Approval**

1. **User requests deposit/withdrawal**
   - Creates record in `deposit_requests` or `withdrawal_requests`
   - Status = 'pending'

2. **Admin approves**
   - Updates status = 'approved'
   - Creates transaction (updates user balance)
   - 5% platform fee calculated on match resolution only

3. **All balance changes via `createTransaction()`**
   - Atomic: Update balance + Insert transaction record
   - Cannot go negative (checked before transaction)

---

## 🎮 Match System

**Race Condition Safe, Server-Authoritative**

1. **Create Match**
   - Lock stake (create transaction: -amount)
   - Insert match (status='waiting')
   - Add creator as player

2. **Join Match**
   - Database transaction (prevents double-join)
   - Lock match row (SELECT FOR UPDATE)
   - Lock stake
   - Add player
   - If 2 players → status='active'

3. **Game Start**
   - Both players connect via Socket.io
   - Server sends countdown (3, 2, 1)
   - Game starts simultaneously (server timestamp)

4. **Match Resolution**
   - First player finishes → opponent gets score 0
   - Calculate winner (highest score)
   - Platform fee = 5% of total pot
   - Winner gets 95%
   - Update balances + transactions

---

## 🔌 Real-time Sync (Socket.io)

**WebSocket for Game State**

### Events

**Client → Server**:
- `join-match` - Player joins match room
- `heartbeat` - Player is still connected (every 3s)
- `submit-result` - Player finishes game
- `leave-match` - Player leaves match

**Server → Client**:
- `countdown` - Game countdown (3, 2, 1)
- `game-start` - Game started (server timestamp)
- `opponent-status` - Opponent connected/disconnected
- `match-complete` - Match finished, winner announced

### Disconnect Handling
- **Heartbeat**: Client sends every 3 seconds
- **Timeout**: If no heartbeat for 10s → mark disconnected
- **Grace Period**: First 15s of game (no false positives)
- **Auto-win**: Opponent disconnected > 20s → other player wins

---

## 🛡️ Anti-Cheat Logic

1. **Server-authoritative scoring**: Client sends result, server validates
2. **No refresh abuse**: Socket.io connection required (reconnect = leave)
3. **Page leave detection**: `beforeunload` → mark as left
4. **Double submission prevention**: Database unique constraints
5. **Race condition prevention**: Database transactions + row locking

---

## 📊 Database Schema (Prisma)

Simple, direct, matching PHP exactly:

- `users` - User accounts (no passwords)
- `games` - Available games
- `matches` - Match instances
- `match_players` - Players in matches (with heartbeat tracking)
- `transactions` - All financial transactions
- `deposit_requests` - Deposit requests (pending/approved/rejected)
- `withdrawal_requests` - Withdrawal requests
- `platform_revenue` - 5% fee tracking per match
- `admin_accounts` - Separate admin login (username/password)

**NO RLS, NO policies, NO magic** - Just tables and constraints.

---

## 🚀 Why This Architecture?

### ✅ Advantages

1. **Full Control**: No auth provider, no RLS, direct database access
2. **Simple Debugging**: Standard SQL, standard Node.js, standard WebSockets
3. **Predictable**: No magic, everything explicit
4. **Performant**: Direct database queries, no abstraction overhead
5. **Flexible**: Easy to modify business logic

### ⚠️ Trade-offs

1. **Auth**: You manage sessions (simple JWT/cookies)
2. **Security**: You ensure proper validation (standard practice)
3. **Scalability**: Socket.io server scales with your app (Vercel + separate Socket.io server if needed)

---

## 📁 Project Structure

```
next-version/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (game)/            # Game routes
│   ├── admin/             # Admin panel
│   └── api/               # API routes
│       ├── auth/          # Auth endpoints
│       ├── matches/       # Match endpoints
│       └── socket/        # Socket.io endpoint
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # Auth helpers (JWT/sessions)
│   ├── wallet.ts          # Transaction logic
│   └── socket.ts          # Socket.io server setup
├── prisma/
│   └── schema.prisma      # Database schema
├── server/
│   └── socket.ts          # Socket.io server (separate process)
└── components/            # React components
```

---

**This architecture gives you complete control while keeping complexity low.**

