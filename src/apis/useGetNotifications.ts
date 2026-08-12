import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export const useGetNotifications = () => {
  const getNotifications = async ({
    signal,
  }: {
    signal?: AbortSignal;
  }): Promise<Notification[]> => {
    const res = await httpClient.get<Notification[]>(Endpoints.NOTIFICATIONS, { signal });
    return res.data;
  };

  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: [Endpoints.NOTIFICATIONS],
    queryFn: getNotifications,
  });

  return { notifications: data ?? [], isLoading };
};
