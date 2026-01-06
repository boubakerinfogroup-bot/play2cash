# 🔍 Deep Audit & Migration Summary

## PHP Platform Audit Results

### Core Authentication Flow

**Location**: `includes/auth.php`, `login.php`

**Behavior**:
1. User enters: Name + WhatsApp + Email (NO password)
2. System checks if WhatsApp exists in database
3. **If exists**: Login user (return existing user)
4. **If not**: Create new user with account_id (format: P2C-XXXXX)
5. Session stores: `user_id`, `language`, `login_time`
6. Language preference saved to user profile

**Edge Cases**:
- Email is REQUIRED for new users
- Duplicate WhatsApp = automatic login (no error)
- Account ID auto-generated using AUTO_INCREMENT
- Language preference persists across sessions

---

### Match Creation Flow

**Location**: `create_challenge.php`

**Behavior**:
1. User selects game and stake (from allowed stakes: 5, 10, 20, 30, 50 TND)
2. System validates stake is in allowed list
3. System checks user has sufficient balance
4. **Lock stake**: Create transaction with negative amount (type: 'stake')
5. Create match record with:
   - `status = 'waiting'`
   - `platform_fee = 0.00` (will be calculated at resolution)
   - `share_link = random_string(32)`
6. Add creator as first player in `match_players`
7. Redirect to `waiting.php`

**Critical Logic**:
- Stake is **locked immediately** (deducted from balance)
- Platform fee calculated only when match completes
- Match can be cancelled after 1 minute (with refund)
- Auto-cancel after 10 minutes if no opponent joins

---

### Match Joining Flow

**Location**: `join_match.php`

**Behavior**:
1. User clicks "Accept" on challenge in lobby
2. System checks:
   - Match status = 'waiting' (not cancelled)
   - Match not full (< 2 players)
   - User has sufficient balance
   - User not already in match
3. **Database transaction** (prevents race conditions):
   - Lock match row (`FOR UPDATE`)
   - Double-check status is still 'waiting'
   - Lock stake (create transaction)
   - Add player to `match_players`
   - Update match `status = 'active'` if now 2 players
   - Set `started_at = NOW()`
4. Commit transaction
5. Redirect to `play.php?match=ID`

**Critical Logic**:
- Uses database transactions to prevent double-joining
- Match becomes 'active' automatically when 2nd player joins
- Both players' stakes are locked at this point

---

### Waiting Room Logic

**Location**: `waiting.php`

**Behavior**:
1. Shows match details (game, stake)
2. Shows share link (can copy/share via WhatsApp)
3. **Cancellation rules**:
   - Button disabled for first 60 seconds
   - Timer counts down from 60s
   - After 60s, user can cancel
   - Double confirmation required
   - Refund goes back to balance
   - Match status → 'cancelled'
4. **Auto-polling**: Checks match status every 3 seconds
   - If status = 'active' → redirect to `play.php`
   - If status = 'cancelled' → redirect to `index.php`

**Critical Logic**:
- 60-second minimum wait before cancellation
- Auto-refresh every 3 seconds
- Match expires after 10 minutes (auto-cancelled by `getOpenChallenges()`)

---

### Game Start Flow

**Location**: `play.php`, `games/*.php`

**Behavior**:
1. Check user is in match (via `match_players`)
2. Get opponent details
3. **Countdown display** (one-time per session):
   - Check session: `countdown_shown_{match_id}`
   - If not shown: Display 10-second countdown (10, 9, 8... 1, 🎮)
   - Mark as shown in session
   - Reload page after countdown
4. **Initialize GameSync** (`game_base.php`):
   - Start heartbeat (every 3 seconds)
   - Start opponent check (every 2 seconds)
   - Block page refresh/close
   - Monitor connection (online/offline events)
5. Load game file (`games/{slug}.php`)

**Critical Logic**:
- Countdown only shows once per session (prevents repeat)
- GameSync runs for entire game duration
- Heartbeat tracks player connection

---

### Game Sync System

**Location**: `assets/js/game-sync.js`, `game_heartbeat.php`

**Heartbeat**:
- Sent every 3 seconds
- Updates `match_players.last_heartbeat = NOW()`
- If heartbeat fails → connection lost warning

**Opponent Check**:
- Checks every 2 seconds
- Returns:
  - `match_completed` → redirect to results
  - `opponent_finished` → opponent finished first (you lose)
  - `opponent_left` → opponent left (you win)
  - `opponent_disconnected` → show waiting overlay (only after 15s grace period)

**Disconnect Handling**:
- **Grace period**: 15 seconds after game start (no false positives)
- **Timeout**: 20 seconds to reconnect
- **Auto-loss**: If still disconnected after 20s

**Page Leave Protection**:
- `beforeunload` event shows browser warning
- `unload` event marks player as left
- Uses `navigator.sendBeacon()` for reliable marking

---

### Match Resolution

**Location**: `games/game_base.php` → `resolveMatch()`

**Behavior**:
1. **Trigger**: When player submits result via `saveGameResult()`
2. **Check**: If both players submitted → resolve immediately
3. **If only one submitted**: First player wins (opponent gets score 0)
4. **Determine winner**:
   - Highest score wins
   - If tie → refund both (no winner)
5. **Calculate winnings**:
   - Total pot = stake × 2
   - Platform fee = total_pot × 0.05 (5%)
   - Winner gets = total_pot - platform_fee (95%)
6. **Update records**:
   - Update `matches`: status='completed', winner_id, completed_at, platform_fee
   - Create transaction for winner: type='win', amount=winnings
   - Insert into `platform_revenue`
7. **Redirect**: Both players redirected to `match_result.php`

**Critical Logic**:
- First-to-finish wins (other player gets score 0)
- Platform fee always 5% (never more, never less)
- Ties refund both players (no platform fee taken)
- Revenue logged per match

---

### Transaction System

**Location**: `includes/functions.php` → `createTransaction()`

**Behavior**:
1. Get current user balance
2. Calculate new balance = balance + amount (can be negative)
3. Update `users.balance` in database
4. Insert transaction record with:
   - `balance_before`
   - `balance_after`
   - `type` (deposit, withdrawal, stake, win, refund, fee)
   - `description`

**Types**:
- `stake`: Negative amount (locked for match)
- `win`: Positive amount (winnings after match)
- `refund`: Positive amount (match cancelled/tie)
- `deposit`: Positive amount (admin approved)
- `withdrawal`: Negative amount (admin approved)

**Critical Logic**:
- Balance updated atomically with transaction record
- All balance changes go through this function
- Balance can never go negative (checked before transactions)

---

### Wallet & Requests

**Location**: `profile.php`

**Deposit Request**:
1. User submits: amount + WhatsApp
2. Creates `deposit_requests` record (status='pending')
3. Admin approves → creates transaction (type='deposit') + updates balance
4. Admin rejects → no transaction

**Withdrawal Request**:
1. User submits: amount + WhatsApp
2. Validates balance is sufficient
3. Creates `withdrawal_requests` record (status='pending')
4. Admin approves → creates transaction (type='withdrawal') + updates balance
5. Admin rejects → no transaction

**Prevention**:
- Session tokens prevent duplicate submissions
- Only one pending request per user allowed

---

### Admin Panel

**Location**: `admin/*.php`

**Separate Auth**:
- Uses `admin_accounts` table (not `users`)
- Username/password authentication
- Default: `admin` / `admin`
- Session: `admin_logged_in = true`

**Features**:
- View all users (with filters)
- Approve/reject deposits
- Approve/reject withdrawals
- View transactions
- View matches
- View revenue (daily/monthly/yearly)
- Delete inactive users (30+ days)

**Revenue Calculation**:
- Sum of `platform_revenue.amount`
- Filterable by date (today, week, month, year, custom)
- Shows: total matches, total stakes, total revenue, total payouts

---

## Migration Status

### ✅ Completed

1. **Database Schema**: Fully migrated to Supabase (PostgreSQL)
   - All tables match PHP structure
   - RLS policies created
   - Triggers for account_id generation

2. **Authentication System**: 
   - No-password login implemented
   - WhatsApp-based user lookup
   - Account creation with auto ID

3. **Basic UI Framework**:
   - Light theme (no dark mode)
   - Mobile-first responsive
   - Blue primary color
   - RTL support structure

4. **Core Pages**:
   - Login page
   - Home page (game selection)
   - Logout page

5. **Utilities**:
   - Format currency
   - Translations (FR/AR)
   - Match helpers
   - Transaction helpers

### 🚧 Remaining Work

1. **Game Pages** (6 games):
   - Fast Math Duel
   - Memory Grid
   - Memory Card
   - Trivia Duel
   - Color Run
   - Logic Maze

2. **Match Flow Pages**:
   - Create challenge page
   - Lobby page (with filters)
   - Waiting room (with cancellation timer)
   - Game play page (with countdown)
   - Match result page

3. **Real-time Sync**:
   - Supabase Realtime subscriptions
   - Heartbeat system
   - Disconnect detection
   - Opponent status checking

4. **Profile & Wallet**:
   - Profile page with account info
   - Transaction history
   - Deposit/withdrawal forms
   - Match history

5. **Admin Panel**:
   - Admin login page
   - Dashboard
   - User management
   - Request approvals
   - Revenue dashboard

6. **Polish**:
   - Error handling
   - Loading states
   - Sound effects (win/lose)
   - Share functionality (WhatsApp link)

---

## Key Behavioral Requirements

### Must Preserve Exactly:

1. **Match Creation**:
   - Stake locked immediately
   - Can cancel after 60 seconds
   - Auto-cancel after 10 minutes

2. **Match Resolution**:
   - First-to-finish wins
   - Platform fee = exactly 5%
   - Ties refund both

3. **Real-time Sync**:
   - 3-second heartbeat
   - 2-second opponent check
   - 15-second grace period
   - 20-second disconnect timeout

4. **Game Start**:
   - 10-second countdown (one-time)
   - Both start simultaneously
   - GameSync initialized before game

5. **Transaction Logic**:
   - Atomic balance updates
   - All changes via createTransaction()
   - Balance never goes negative

---

## Next Steps

1. Continue building game pages (start with Fast Math)
2. Implement match creation flow
3. Build waiting room with cancellation
4. Set up Supabase Realtime subscriptions
5. Implement match resolution logic
6. Build profile and admin pages
7. Test all edge cases
8. Deploy to Vercel

---

**This audit ensures 1:1 behavior preservation in the Next.js migration.**

