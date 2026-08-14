import { useTranslation } from 'react-i18next';
import { Switch, Label } from '~root/components/ui';
import { useGetSettings, useUpdateSettings } from '~root/apis';
import { TIMEZONES } from '~root/constants';

const resolveLocalTimezone = (): string => {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (TIMEZONES as readonly string[]).includes(detected) ? detected : 'Asia/Ho_Chi_Minh';
};

export const TimezoneSwitch = () => {
  const { t } = useTranslation('admin-members');
  const { settings } = useGetSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const isUtc = settings?.timezone === 'UTC';

  const toggle = (checked: boolean) => {
    updateSettings({ timezone: checked ? 'UTC' : resolveLocalTimezone() });
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="admin-members-timezone-switch" className="text-sm text-muted-foreground">
        {isUtc ? t('filter.timezoneUtc') : t('filter.timezoneLocal')}
      </Label>
      <Switch id="admin-members-timezone-switch" checked={isUtc} onCheckedChange={toggle} />
    </div>
  );
};
