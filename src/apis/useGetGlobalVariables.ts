import { useQuery } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { KeyValuePair } from '~root/types';

type GlobalVariablesResponse = { variables: KeyValuePair[] };

export const useGetGlobalVariables = () => {
  const getGlobalVariables = async ({
    signal,
  }: {
    signal?: AbortSignal;
  }): Promise<GlobalVariablesResponse> => {
    const res = await httpClient.get<GlobalVariablesResponse>(Endpoints.REST_GLOBAL_VARIABLES, {
      signal,
    });
    return res.data;
  };

  const { data, isLoading } = useQuery<GlobalVariablesResponse>({
    queryKey: [Endpoints.REST_GLOBAL_VARIABLES],
    queryFn: getGlobalVariables,
  });

  return { variables: data?.variables ?? [], isLoading };
};
