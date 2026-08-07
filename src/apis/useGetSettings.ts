import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints, Theme } from '~root/constants';

export type Settings = {
  language: string;
  timezone: string;
  theme: Theme;
  emailNotifications: boolean;
};

export const useGetSettings = () => {
  const getSettings = async ({ signal }: { signal?: AbortSignal }): Promise<Settings> => {
    const res = await httpClient.get<Settings>(Endpoints.SETTINGS, { signal });
    return res.data;
  };

  const { data, isLoading, isError, refetch } = useQuery<Settings>({
    queryKey: [Endpoints.SETTINGS],
    queryFn: getSettings,
  });

  return { settings: data, isLoading, isError, refetch };
};
