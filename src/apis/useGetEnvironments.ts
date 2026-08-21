import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Environment } from '~root/types';

export const useGetEnvironments = () => {
  const getEnvironments = async ({ signal }: { signal?: AbortSignal }): Promise<Environment[]> => {
    const res = await httpClient.get<Environment[]>(Endpoints.REST_ENVIRONMENTS, { signal });
    return res.data;
  };

  const { data, isLoading } = useQuery<Environment[]>({
    queryKey: [Endpoints.REST_ENVIRONMENTS],
    queryFn: getEnvironments,
  });

  return { environments: data ?? [], isLoading };
};
