import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import { AccountTab, AppearanceTab, GeneralTab, NotificationsTab } from './components';

const VALID_TABS = ['general', 'appearance', 'notifications', 'account'] as const;
type SettingsTab = (typeof VALID_TABS)[number];

const isValidTab = (value: string | null): value is SettingsTab =>
  !!value && (VALID_TABS as readonly string[]).includes(value);

export const SettingsPage = () => {
  const { t } = useTranslation('settings-general');
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: SettingsTab = isValidTab(tabParam) ? tabParam : 'general';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList>
          <TabsTrigger value="general">{t('title')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings-appearance:title')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings-notifications:title')}</TabsTrigger>
          <TabsTrigger value="account">{t('settings-account:title')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
