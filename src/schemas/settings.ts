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

export const useChangePasswordSchema = () => {
  const { t } = useTranslation('settings-account');
  return z
    .object({
      currentPassword: z.string().min(1, t('validation.currentPasswordRequired')),
      newPassword: z.string().min(8, t('validation.newPasswordMinLength')),
      confirmPassword: z.string().min(1, t('validation.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
};

export type ChangePasswordValues = z.infer<ReturnType<typeof useChangePasswordSchema>>;
