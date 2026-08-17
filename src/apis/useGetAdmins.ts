import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints, Role } from '~root/constants';

export type Admin = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  address: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminListParams = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  address?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
};

export type AdminListResponse = {
  items: Admin[];
  total: number;
  page: number;
  pageSize: number;
};

export const useGetAdmins = (params: AdminListParams) => {
  const getAdmins = async ({ signal }: { signal?: AbortSignal }): Promise<AdminListResponse> => {
    const res = await httpClient.get<AdminListResponse>(Endpoints.ADMIN_ADMINS, {
      params,
      signal,
    });
    return res.data;
  };

  const { data, isLoading, isError, refetch } = useQuery<AdminListResponse>({
    queryKey: [Endpoints.ADMIN_ADMINS, params],
    queryFn: getAdmins,
    placeholderData: (previous) => previous,
  });

  return { data, isLoading, isError, refetch };
};
