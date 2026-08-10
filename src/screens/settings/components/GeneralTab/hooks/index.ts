import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useGetSettings, useUpdateSettings } from '~root/apis';
import { generalSettingsSchema, type GeneralSettingsValues } from '~root/schemas';

export const useGeneralTabHooks = () => {
  const { settings, isLoading, isError, refetch } = useGetSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const { control, handleSubmit, reset } = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { language: 'vi', timezone: 'Asia/Ho_Chi_Minh' },
  });

  useEffect(() => {
    if (settings) {
      reset({ language: settings.language === 'en' ? 'en' : 'vi', timezone: settings.timezone });
    }
  }, [settings, reset]);

  const onSubmit = (values: GeneralSettingsValues) => {
    updateSettings(values, {
      onSuccess: () => toast.success('Đã lưu cài đặt.', { position: 'bottom-center' }),
      onError: () => toast.error('Lưu cài đặt thất bại.', { position: 'bottom-center' }),
    });
  };

  return {
    control,
    handleSubmit,
    onSubmit,
    isLoading,
    isError,
    refetch,
    isPending,
    settings,
  };
};
