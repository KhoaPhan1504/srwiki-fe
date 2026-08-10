import { Link } from 'react-router-dom';
import { ACCOUNT_INFO_FIELDS, QUICK_LINKS, STAT_CARDS } from './configs';
import { useDashboardHooks } from './hooks';
import { QueryErrorCard } from '~root/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '~root/components/ui';
import { formatDate } from '~root/utils';

export const DashboardPage = () => {
  const { profile, isLoading, isError, refetch, completionPercent } = useDashboardHooks();

  if (isError) {
    return (
      <QueryErrorCard message="Không thể tải dữ liệu bảng điều khiển." onRetry={() => refetch()} />
    );
  }

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
        {STAT_CARDS.map(({ key, title, icon: Icon, renderContent, contentClassName }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className={contentClassName ?? 'text-lg font-semibold'}>
              {renderContent({ profile, completionPercent })}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ACCOUNT_INFO_FIELDS.map(({ key, label, getValue }) => (
              <p key={key}>
                <span className="text-muted-foreground">{label}: </span>
                {getValue(profile)}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liên kết nhanh</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_LINKS.map(({ key, to, label }) => (
              <Button key={key} asChild variant="outline" className="justify-start">
                <Link to={to}>{label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
