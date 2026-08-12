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

    supabaseRealtimeClient.realtime.setAuth(auth.token);

    const channel = supabaseRealtimeClient
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
      .subscribe();

    return () => {
      supabaseRealtimeClient.removeChannel(channel);
    };
  }, [auth?.token, auth?.user?.id, queryClient]);
};
