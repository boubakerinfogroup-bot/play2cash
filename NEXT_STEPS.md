# 📋 Next Steps - What to Build

## ✅ Completed

- [x] Architecture design
- [x] Prisma schema (matching PHP exactly)
- [x] Authentication system (no passwords)
- [x] Wallet/transaction logic (5% platform fee)
- [x] Match system (create, join, cancel, resolve)
- [x] Socket.io setup (real-time sync)
- [x] Database seed script
- [x] Deployment guide

## 🚧 Still To Build

### Priority 1: Core Pages

1. **Home Page** (`/`)
   - List games (already started)
   - Use Prisma to load games
   - Show user balance

2. **Game Selection** (`/game?slug=...`)
   - Create challenge button
   - Join lobby button

3. **Create Challenge** (`/create?game=...`)
   - Stake selection dropdown
   - Validation
   - Redirect to waiting room

4. **Lobby** (`/lobby?game=...`)
   - List open challenges
   - Stake filter
   - Join match functionality

5. **Waiting Room** (`/waiting?match=...`)
   - Share link display
   - 60-second cancellation timer
   - Poll match status (or use Socket.io)
   - Redirect when active

6. **Game Play** (`/play?match=...`)
   - Countdown overlay (Socket.io event)
   - Game rendering area
   - Submit result
   - Real-time opponent status

7. **Match Result** (`/result?match=...`)
   - Winner/loser display
   - Score comparison
   - Winnings display
   - Sound effects

8. **Profile** (`/profile`)
   - Account info
   - Transaction history
   - Deposit/withdrawal forms
   - Match history

### Priority 2: Game Implementations

Build each game matching PHP behavior:

1. **Fast Math Duel** (`/games/fast-math.tsx`)
   - Math questions
   - Score calculation
   - Submit result

2. **Memory Grid** (`/games/memory-grid.tsx`)
   - Tile matching
   - Score = completion time

3. **Memory Card** (`/games/memory-card.tsx`)
   - Card matching
   - Score = completion time

4. **Trivia Duel** (`/games/trivia.tsx`)
   - Questions
   - Score calculation

5. **Color Run** (`/games/color-run.tsx`)
   - Color reaction game
   - Score = correct taps

6. **Logic Maze** (`/games/logic-maze.tsx`)
   - Maze navigation
   - Score = completion time

### Priority 3: Admin Panel

1. **Admin Login** (`/admin/login`)
   - Username/password
   - Session management

2. **Admin Dashboard** (`/admin`)
   - Overview stats
   - Quick actions

3. **Users** (`/admin/users`)
   - List all users
   - Delete inactive (30+ days)

4. **Deposits** (`/admin/deposits`)
   - List pending requests
   - Approve/reject buttons

5. **Withdrawals** (`/admin/withdrawals`)
   - List pending requests
   - Approve/reject buttons

6. **Revenue** (`/admin/revenue`)
   - Daily/monthly/yearly stats
   - Platform fee tracking

### Priority 4: Socket.io Integration

1. **Client Setup** (`lib/socket-client.ts`)
   - Socket.io client initialization
   - Event handlers
   - Reconnection logic

2. **Game Sync** (integrate into game pages)
   - Join match room on load
   - Send heartbeat every 3s
   - Check opponent every 2s
   - Handle countdown event
   - Handle game-start event
   - Handle opponent-status events

3. **Disconnect Handling**
   - Show warning on disconnect
   - 20-second countdown
   - Auto-win logic

### Priority 5: Polish

1. **Error Handling**
   - User-friendly error messages
   - Error boundaries

2. **Loading States**
   - Spinners
   - Skeleton loaders

3. **Sound Effects**
   - Win sound
   - Lose sound
   - Game sounds

4. **Notifications**
   - Match started
   - Opponent disconnected
   - Match complete

---

## 🎯 Implementation Order

**Week 1: Core Flow**
1. Update home page (use Prisma)
2. Create challenge page
3. Waiting room page
4. Lobby page

**Week 2: Games**
1. Fast Math Duel (simplest)
2. One more game
3. Test match flow end-to-end

**Week 3: Real-time**
1. Socket.io client setup
2. Integrate into game pages
3. Test countdown, sync, disconnect

**Week 4: Admin & Polish**
1. Admin panel
2. Error handling
3. Sound effects
4. Final testing

---

## 💡 Quick Wins

1. **Update Home Page**: Replace Supabase calls with Prisma
2. **Create Challenge**: Build form, connect to API
3. **Fast Math Game**: Simplest game to implement
4. **Socket.io Client**: Reusable across all games

---

**Start with the core flow, then add games one by one!**

