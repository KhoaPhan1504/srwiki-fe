import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const useProfileFormSchema = () => {
  const { t } = useTranslation('profile');
  return z.object({
    fullName: z.string().min(1, t('validation.fullNameRequired')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    bio: z.string().max(280, t('validation.bioMaxLength')).optional(),
    phone: z.string().optional(),
  });
};

export type ProfileFormValues = z.infer<ReturnType<typeof useProfileFormSchema>>;
