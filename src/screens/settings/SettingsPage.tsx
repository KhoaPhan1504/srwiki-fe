import { Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui/tabs';
import { GeneralTab } from '~root/screens/settings/GeneralTab';
import { AppearanceTab } from '~root/screens/settings/AppearanceTab';
import { NotificationsTab } from '~root/screens/settings/NotificationsTab';

export const SettingsPage = () => (
  <div className="max-w-2xl space-y-6">
    <h1 className="text-2xl font-semibold">Cài đặt</h1>
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">Chung</TabsTrigger>
        <TabsTrigger value="appearance">Giao diện</TabsTrigger>
        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
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
    </Tabs>
  </div>
);
