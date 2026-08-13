import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_INFO_FIELDS, QUICK_LINKS, STAT_CARDS } from './configs';
import { useDashboardHooks } from './hooks';
import { QueryErrorCard } from '~root/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '~root/components/ui';
import { formatDate } from '~root/utils';

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');
  const { profile, isLoading, isError, refetch, completionPercent } = useDashboardHooks();

  if (isError) {
    return <QueryErrorCard message={t('error')} onRetry={() => refetch()} />;
  }

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('welcome', { name: profile.fullName || profile.email })}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate(new Date())}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(
          ({ key, titleKey, icon: Icon, renderContent, contentClassName, badgeColorVar }) => (
            <Card key={key} className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t(titleKey)}
                </CardTitle>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `color-mix(in oklch, var(${badgeColorVar}) 15%, transparent)`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color: `var(${badgeColorVar})` }} />
                </span>
              </CardHeader>
              <CardContent className={contentClassName ?? 'text-2xl font-bold'}>
                {renderContent({ profile, completionPercent, t })}
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
          <CardHeader>
            <CardTitle>{t('accountInfo.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ACCOUNT_INFO_FIELDS.map(({ key, labelKey, getValue }) => (
              <p key={key}>
                <span className="text-muted-foreground">{t(labelKey)}: </span>
                {getValue(profile)}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-[var(--dashboard-card-shadow)]">
          <CardHeader>
            <CardTitle>{t('quickLinks.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_LINKS.map(({ key, to, labelKey }) => (
              <Button key={key} asChild variant="outline" className="justify-start">
                <Link to={to}>{t(labelKey)}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
