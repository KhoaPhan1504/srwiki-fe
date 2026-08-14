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

export const useCreateMemberSchema = () => {
  const { t } = useTranslation('admin-members');
  return z.object({
    email: z.string().email(t('create.validation.emailInvalid')),
    password: z.string().min(8, t('create.validation.passwordMinLength')),
    fullName: z.string().min(1, t('create.validation.fullNameRequired')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
  });
};

export type CreateMemberValues = z.infer<ReturnType<typeof useCreateMemberSchema>>;

export const useEditMemberSchema = () => {
  const { t } = useTranslation('admin-members');
  return z.object({
    fullName: z.string().min(1, t('edit.validation.fullNameRequired')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    membershipTier: z.enum(['regular', 'vip']),
  });
};

export type EditMemberValues = z.infer<ReturnType<typeof useEditMemberSchema>>;

export const useCreateAdminSchema = () => {
  const { t } = useTranslation('admin-members');
  return z.object({
    email: z.string().email(t('createAdmin.validation.emailInvalid')),
    password: z.string().min(8, t('createAdmin.validation.passwordMinLength')),
    fullName: z.string().min(1, t('createAdmin.validation.fullNameRequired')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
  });
};

export type CreateAdminValues = z.infer<ReturnType<typeof useCreateAdminSchema>>;

export const useEditAdminSchema = () => {
  const { t } = useTranslation('admin-members');
  return z.object({
    fullName: z.string().min(1, t('editAdmin.validation.fullNameRequired')),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
  });
};

export type EditAdminValues = z.infer<ReturnType<typeof useEditAdminSchema>>;
