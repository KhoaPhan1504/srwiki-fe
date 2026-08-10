import { Controller } from 'react-hook-form';
import { TIMEZONES } from '~root/constants';
import { useGeneralTabHooks } from './hooks';
import { QueryErrorCard } from '~root/components/common';
import {
  Button,
  Card,
  CardContent,
  Label,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~root/components/ui';

export const GeneralTab = () => {
  const { control, onSubmit, isLoading, handleSubmit, isError, refetch, settings, isPending } =
    useGeneralTabHooks();

  if (isError) {
    return <QueryErrorCard message="Không thể tải cài đặt chung." onRetry={() => refetch()} />;
  }

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
