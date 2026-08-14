import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const useFilterSchema = () => {
  const { t } = useTranslation('admin-members');
  return z
    .object({
      membershipTier: z.array(z.enum(['regular', 'vip'])),
      createdAtFrom: z.string(),
      createdAtTo: z.string(),
      address: z.string(),
      birthdayFrom: z.string(),
      birthdayTo: z.string(),
    })
    .refine(
      (data) => !data.createdAtFrom || !data.createdAtTo || data.createdAtFrom <= data.createdAtTo,
      { message: t('filter.invalidCreatedAtRange'), path: ['createdAtTo'] },
    )
    .refine(
      (data) => !data.birthdayFrom || !data.birthdayTo || data.birthdayFrom <= data.birthdayTo,
      { message: t('filter.invalidBirthdayRange'), path: ['birthdayTo'] },
    );
};

export type FilterFormValues = z.infer<ReturnType<typeof useFilterSchema>>;
