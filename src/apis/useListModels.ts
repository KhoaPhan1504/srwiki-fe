import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

export type ModelOut = {
  id: string;
  label: string;
  provider: string;
};

export const useListModels = () => {
  const getModels = async ({ signal }: { signal?: AbortSignal }): Promise<ModelOut[]> => {
    const res = await httpClient.get<{ models: ModelOut[] }>(Endpoints.AI_MODELS, { signal });
    return res.data.models;
  };

  const { data, isLoading } = useQuery<ModelOut[]>({
    queryKey: [Endpoints.AI_MODELS],
    queryFn: getModels,
  });

  return { models: data ?? [], isLoading };
};
