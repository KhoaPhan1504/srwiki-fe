import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const useGeneralSettingsSchema = () => {
  const { t } = useTranslation('settings-general');
  return z.object({
    language: z.enum(['vi', 'en']),
    timezone: z.string().min(1, t('validation.timezoneRequired')),
  });
};

export type GeneralSettingsValues = z.infer<ReturnType<typeof useGeneralSettingsSchema>>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
