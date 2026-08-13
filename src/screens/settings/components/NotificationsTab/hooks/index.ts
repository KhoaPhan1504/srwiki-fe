import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useGetSettings, useUpdateSettings } from '~root/apis';

export const useNotificationsTabHooks = () => {
  const { t } = useTranslation('settings-notifications');
  const { settings, isLoading, isError, refetch } = useGetSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (settings) {
      // Mirrors the fetched setting into local state so the switch can toggle
      // optimistically and roll back on error; same pattern used in ProfilePage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmailNotifications(settings.emailNotifications);
    }
  }, [settings]);

  const handleToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    updateSettings(
      { emailNotifications: checked },
      {
        onSuccess: () => toast.success(t('saveSuccess'), { position: 'bottom-center' }),
        onError: () => {
          setEmailNotifications(!checked);
          toast.error(t('saveError'), { position: 'bottom-center' });
        },
      },
    );
  };
  return {
    settings,
    isLoading,
    isError,
    refetch,
    emailNotifications,
    handleToggle,
  };
};
