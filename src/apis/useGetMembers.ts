import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints, Role } from '~root/constants';

export type MembershipTier = 'regular' | 'vip';

export type Member = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  membershipTier: MembershipTier | null;
  address: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberListParams = {
  page: number;
  pageSize: number;
  membershipTier?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  address?: string;
  birthdayFrom?: string;
  birthdayTo?: string;
};

export type MemberListResponse = {
  items: Member[];
  total: number;
  page: number;
  pageSize: number;
};

export const useGetMembers = (params: MemberListParams) => {
  const getMembers = async ({ signal }: { signal?: AbortSignal }): Promise<MemberListResponse> => {
    const res = await httpClient.get<MemberListResponse>(Endpoints.ADMIN_MEMBERS, {
      params,
      signal,
    });
    return res.data;
  };

  const { data, isLoading, isError, refetch } = useQuery<MemberListResponse>({
    queryKey: [Endpoints.ADMIN_MEMBERS, params],
    queryFn: getMembers,
    placeholderData: (previous) => previous,
  });

  return { data, isLoading, isError, refetch };
};
