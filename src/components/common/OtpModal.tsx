import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSendOtp } from '~root/apis/useSendOtp';
import { useVerifyOtp } from '~root/apis/useVerifyOtp';

const OTP_TTL_SECONDS = 5 * 60;

type Props = {
  phone: string;
  onClose: () => void;
  onVerified: () => void;
};

export const OtpModal = ({ phone, onClose, onVerified }: Props) => {
  const { t } = useTranslation('profile');
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const { mutate: sendOtp, isPending: isSending } = useSendOtp();
  const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();

  const requestOtp = () => {
    sendOtp(phone, {
      onSuccess: (data) => {
        if (data.debugOtp) {
          toast.info(t('otp.devCode', { code: data.debugOtp }), {
            position: 'bottom-center',
            autoClose: false,
          });
        }
      },
      onError: () => toast.error(t('otp.sendError'), { position: 'bottom-center' }),
    });
  };

  useEffect(() => {
    requestOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = () => {
    setSecondsLeft(OTP_TTL_SECONDS);
    requestOtp();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    verifyOtp(
      { phone, code },
      {
        onSuccess: () => {
          toast.success(t('otp.verifySuccess'), { position: 'bottom-center' });
          onVerified();
        },
        onError: () => toast.error(t('otp.verifyError'), { position: 'bottom-center' }),
      },
    );
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">{t('otp.title')}</h2>
        <p className="mb-4 text-sm text-slate-600">{t('otp.description', { phone })}</p>
        <form onSubmit={handleSubmit}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 tracking-widest"
          />
          <p className="mb-4 text-xs text-slate-500">
            {t('otp.expiresIn', { time: `${minutes}:${seconds}` })}
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 rounded bg-slate-900 py-2 text-white disabled:opacity-50"
            >
              {t('otp.confirm')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-4 py-2 text-slate-700"
            >
              {t('otp.close')}
            </button>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || secondsLeft > 0}
            className="mt-3 text-sm font-medium text-slate-700 underline disabled:opacity-40"
          >
            {t('otp.resend')}
          </button>
        </form>
      </div>
    </div>
  );
};
