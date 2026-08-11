import { z } from 'zod';

export const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(280, 'Tiểu sử tối đa 280 ký tự').optional(),
  phone: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
