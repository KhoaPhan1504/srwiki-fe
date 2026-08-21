import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { Collection } from '~root/types';

export const useGetCollections = () => {
  const getCollections = async ({ signal }: { signal?: AbortSignal }): Promise<Collection[]> => {
    const res = await httpClient.get<Collection[]>(Endpoints.REST_COLLECTIONS, { signal });
    return res.data;
  };

  const { data, isLoading } = useQuery<Collection[]>({
    queryKey: [Endpoints.REST_COLLECTIONS],
    queryFn: getCollections,
  });

  return { collections: data ?? [], isLoading };
};
