import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Mail, Phone, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui/card';
import { Badge } from '~root/components/ui/badge';
import { Button } from '~root/components/ui/button';
import { Skeleton } from '~root/components/ui/skeleton';
import { useGetProfile } from '~root/apis/useGetProfile';
import type { Profile } from '~root/apis/useGetProfile';

const COMPLETION_FIELDS: (keyof Pick<
  Profile,
  'avatarUrl' | 'bio' | 'address' | 'dateOfBirth' | 'phoneVerified'
>)[] = ['avatarUrl', 'bio', 'address', 'dateOfBirth', 'phoneVerified'];

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(
    typeof value === 'string' ? new Date(value) : value,
  );

export const DashboardPage = () => {
  const { profile, isLoading } = useGetProfile();

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const filled = COMPLETION_FIELDS.filter((field) => Boolean(profile[field])).length;
    return Math.round((filled / COMPLETION_FIELDS.length) * 100);
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard 👋</h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại, {profile.fullName || profile.email}!
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(new Date())}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thành viên từ
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-lg font-semibold">
            {formatDate(profile.createdAt)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hồ sơ hoàn thiện
            </CardTitle>
            <UserRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-lg font-semibold">{completionPercent}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Số điện thoại
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={profile.phoneVerified ? 'default' : 'secondary'}>
              {profile.phoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="truncate text-lg font-semibold">{profile.email}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Họ và tên: </span>
              {profile.fullName || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {profile.email}
            </p>
            <p>
              <span className="text-muted-foreground">Số điện thoại: </span>
              {profile.phone || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Địa chỉ: </span>
              {profile.address || '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liên kết nhanh</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/profile">Chỉnh sửa hồ sơ</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/settings">Cài đặt tài khoản</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
