import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export type Profile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  address: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: 'admin' | 'member';
  membershipTier: 'regular' | 'vip' | null;
  createdAt: string;
  updatedAt: string;
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
