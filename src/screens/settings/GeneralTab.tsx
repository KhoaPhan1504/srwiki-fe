import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Card, CardContent } from '~root/components/ui/card';
import { Label } from '~root/components/ui/label';
import { Button } from '~root/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui/select';
import { Skeleton } from '~root/components/ui/skeleton';
import { useGetSettings } from '~root/apis/useGetSettings';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';
import { generalSettingsSchema } from '~root/schemas/settings';
import type { GeneralSettingsValues } from '~root/schemas/settings';

const TIMEZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
];

export const GeneralTab = () => {
  const { settings, isLoading } = useGetSettings();
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

  if (isLoading || !settings) {
    return <Skeleton className="h-48" />;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ngôn ngữ</Label>
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Múi giờ</Label>
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
