import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  address: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
};

export const useGetProfile = () => {
  const getProfile = async ({ signal }: { signal?: AbortSignal }): Promise<Profile> => {
    const res = await httpClient.get<Profile>(Endpoints.PROFILE, { signal });
    return res.data;
  };

  const { data, isLoading, isError, refetch } = useQuery<Profile>({
    queryKey: [Endpoints.PROFILE],
    queryFn: getProfile,
  });

  return { profile: data, isLoading, isError, refetch };
};
