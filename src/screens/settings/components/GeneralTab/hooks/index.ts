import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useGetSettings, useUpdateSettings, type Settings } from '~root/apis';
import { generalSettingsSchema, type GeneralSettingsValues } from '~root/schemas';

// Query-only hook: safe to call unconditionally at the top of GeneralTab,
// before `settings` exists.
export const useGeneralTabQuery = () => useGetSettings();

// Form hook: only ever called once `settings` has already loaded (see
// GeneralTabForm in ../index.tsx), so `defaultValues` is seeded with the
// real fetched values from the very first render. This deliberately avoids
// initializing with placeholder values and then calling reset()/using the
// `values` option to sync later -- Radix Select's SelectValue does not
// reliably re-render when a Controller-bound value changes post-mount, so a
// value transition after the Select has already mounted can leave it
// visually blank even though the underlying form state is correct. Seeding
// the correct value at mount time (no later transition) sidesteps that.
export const useGeneralTabForm = (settings: Settings) => {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      language: settings.language === 'en' ? 'en' : 'vi',
      timezone: settings.timezone,
    },
  });

  const onSubmit = (values: GeneralSettingsValues) => {
    updateSettings(values, {
      onSuccess: () => toast.success('Đã lưu cài đặt.', { position: 'bottom-center' }),
      onError: () => toast.error('Lưu cài đặt thất bại.', { position: 'bottom-center' }),
    });
  };

  return { form, onSubmit, isPending };
};
