// API Client for Express Backend
// Replaces direct Prisma calls with REST API calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

// Set auth token
export function setToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
}

// Clear auth token
export function clearToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
}

// Generic API call with auth
async function apiCall(endpoint: string, options: RequestInit = {}) {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
    async login(name: string, whatsapp: string, email: string, language: 'fr' | 'ar' = 'fr') {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ name, whatsapp, email, language })
        });

        if (response.success && response.token) {
            setToken(response.token);
        }

        return response;
    },

    async me() {
        return apiCall('/auth/me');
    },

    async logout() {
        const response = await apiCall('/auth/logout', { method: 'POST' });
        clearToken();
        return response;
    }
};

// ============================================================================
// GAMES API
// ============================================================================
export const gamesAPI = {
    async list() {
        return apiCall('/games');
    },

    async get(slug: string) {
        return apiCall(`/games/${slug}`);
    }
};

// ============================================================================
// MATCHES API
// ============================================================================
export const matchesAPI = {
    async create(gameId: string, stake: number) {
        return apiCall('/matches/create', {
            method: 'POST',
            body: JSON.stringify({ gameId, stake })
        });
    },

    async join(matchId: string) {
        return apiCall(`/matches/${matchId}/join`, { method: 'POST' });
    },

    async requestJoin(matchId: string) {
        return apiCall(`/matches/${matchId}/request-join`, { method: 'POST' });
    },

    async acceptJoin(matchId: string, requestId: string) {
        return apiCall(`/matches/${matchId}/accept-join`, {
            method: 'POST',
            body: JSON.stringify({ requestId })
        });
    },

    async start(matchId: string) {
        return apiCall(`/matches/${matchId}/start`, { method: 'POST' });
    },

    async finish(matchId: string, score: number, gameData: any) {
        return apiCall(`/matches/${matchId}/finish`, {
            method: 'POST',
            body: JSON.stringify({ score, gameData })
        });
    },

    async get(matchId: string) {
        return apiCall(`/matches/${matchId}`);
    },

    async live(gameId?: string) {
        const params = gameId ? `?gameId=${gameId}` : '';
        return apiCall(`/matches/live${params}`);
    },

    async getUserMatches(userId: string, filter = 'all') {
        return apiCall(`/matches/user/${userId}?filter=${filter}`);
    },

    async cancel(matchId: string) {
        return apiCall(`/matches/${matchId}/cancel`, { method: 'POST' });
    }
};

// ============================================================================
// WALLET API
// ============================================================================
export const walletAPI = {
    async getBalance() {
        return apiCall('/wallet');
    },

    async getTransactions(limit = 50, offset = 0) {
        return apiCall(`/wallet/transactions?limit=${limit}&offset=${offset}`);
    },

    async deposit(amount: number, whatsapp: string) {
        return apiCall('/wallet/deposit', {
            method: 'POST',
            body: JSON.stringify({ amount, whatsapp })
        });
    },

    async withdraw(amount: number, whatsapp: string) {
        return apiCall('/wallet/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, whatsapp })
        });
    },

    async getRequests() {
        return apiCall('/wallet/requests');
    }
};

// ============================================================================
// ADMIN API
// ============================================================================
export const adminAPI = {
    async login(username: string, password: string) {
        const response = await apiCall('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        if (response.success && response.token) {
            setToken(response.token);
        }

        return response;
    },

    async getStats() {
        return apiCall('/admin/stats');
    },

    async getDeposits(status = 'PENDING') {
        return apiCall(`/admin/deposits?status=${status}`);
    },

    async approveDeposit(id: string) {
        return apiCall(`/admin/deposits/${id}/approve`, { method: 'POST' });
    },

    async getWithdrawals(status = 'PENDING') {
        return apiCall(`/admin/withdrawals?status=${status}`);
    },

    async approveWithdrawal(id: string) {
        return apiCall(`/admin/withdrawals/${id}/approve`, { method: 'POST' });
    }
};

export default {
    auth: authAPI,
    games: gamesAPI,
    matches: matchesAPI,
    wallet: walletAPI,
    admin: adminAPI
};
