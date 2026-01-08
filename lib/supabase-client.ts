// Supabase Client for Realtime
// Used for live match updates, presence tracking

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Subscribe to match updates
export function subscribeToMatch(
    matchId: string,
    onUpdate: (match: any) => void
) {
    const channel = supabase
        .channel(`match:${matchId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'matches',
                filter: `id=eq.${matchId}`
            },
            (payload) => {
                onUpdate(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Subscribe to match players
export function subscribeToMatchPlayers(
    matchId: string,
    onUpdate: (player: any) => void
) {
    const channel = supabase
        .channel(`match_players:${matchId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'match_players',
                filter: `match_id=eq.${matchId}`
            },
            (payload) => {
                onUpdate(payload.new);
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Track presence in match
export async function trackPresence(
    matchId: string,
    userId: string,
    userName: string
) {
    const channel = supabase.channel(`presence:${matchId}`);

    await channel.track({
        userId,
        userName,
        online: true,
        lastSeen: new Date().toISOString()
    });

    return channel;
}
