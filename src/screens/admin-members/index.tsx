import { useTranslation } from 'react-i18next';

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
    </div>
  );
};
