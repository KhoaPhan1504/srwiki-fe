import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';
import type { HeaderInspectionResponse } from '~root/types';

const inspectHeaders = async (url: string): Promise<HeaderInspectionResponse> => {
  const res = await httpClient.post<HeaderInspectionResponse>(Endpoints.HEADERS_INSPECTOR, {
    url,
  });
  return res.data;
};

export const useInspectHeaders = () => {
  return useMutation({
    mutationFn: inspectHeaders,
  });
};
