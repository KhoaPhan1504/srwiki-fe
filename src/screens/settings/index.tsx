import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import { AccountTab, AppearanceTab, GeneralTab, NotificationsTab } from './components';

const VALID_TABS = ['general', 'appearance', 'notifications', 'account'] as const;
type SettingsTab = (typeof VALID_TABS)[number];

const isValidTab = (value: string | null): value is SettingsTab =>
  !!value && (VALID_TABS as readonly string[]).includes(value);

export const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: SettingsTab = isValidTab(tabParam) ? tabParam : 'general';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Cài đặt</h1>
      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
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
