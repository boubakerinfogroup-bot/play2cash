// Shared TypeScript types for the Play2Cash application

export interface User {
    id: string
    name: string
    whatsapp: string
    email: string
    balance: number
    accountId: string | null
    languagePreference: 'fr' | 'ar'
    isAdmin: boolean
}

export interface Game {
    id: string
    slug: string
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    minStake: number
    maxStake: number
    platformFeePercentage: number
    isActive: boolean
    imageUrl?: string | null
    createdAt: string
    updatedAt: string
}

export interface Match {
    id: string
    gameId: string
    player1Id: string
    player2Id?: string | null
    stake: number
    status: 'waiting' | 'countdown' | 'in_progress' | 'finished' | 'cancelled'
    winnerId?: string | null
    player1Seed?: string | null
    player2Seed?: string | null
    countdownStartsAt?: string | null
    startedAt?: string | null
    finishedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface Transaction {
    id: string
    userId: string
    type: 'deposit' | 'withdrawal' | 'stake' | 'winnings' | 'refund' | 'fee'
    amount: number
    balanceAfter: number
    status: 'pending' | 'approved' | 'rejected'
    matchId?: string | null
    createdAt: string
}
