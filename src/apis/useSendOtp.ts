import { useMutation } from '@tanstack/react-query';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

type SendOtpResponse = { message: string; debug_otp?: string };

export const useSendOtp = () =>
  useMutation({
    mutationFn: async (phone: string) => {
      const res = await httpClient.post<SendOtpResponse>(Endpoints.PROFILE_PHONE_SEND_OTP, {
        phone,
      });
      return res.data;
    },
  });
