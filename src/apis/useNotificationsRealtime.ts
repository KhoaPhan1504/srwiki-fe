import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { authAtom } from '~root/stores';
import { Endpoints } from '~root/constants';
import { supabaseRealtimeClient } from '~root/lib/supabase-realtime-client';

export const useNotificationsRealtime = () => {
  const auth = useAtomValue(authAtom);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth?.token || !auth.user?.id) return;

    const client = supabaseRealtimeClient;
    if (!client) {
      console.warn(
        'Supabase Realtime client is unavailable (missing env vars) — notifications will only update on refetch/reload.',
      );
      return;
    }

    const channel = client
      .channel(`notifications:${auth.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${auth.user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [Endpoints.NOTIFICATIONS] });
        },
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Notifications realtime subscription failed:', status, err);
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, [auth?.token, auth?.user?.id, queryClient]);
};
