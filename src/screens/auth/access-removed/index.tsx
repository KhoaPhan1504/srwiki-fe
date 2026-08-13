import { useTranslation } from 'react-i18next';

export const AccessRemovedPage = () => {
  const { t } = useTranslation('auth');
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-900">{t('accessRemoved.title')}</h1>
        <p className="text-slate-600">{t('accessRemoved.description')}</p>
      </div>
    </div>
  );
};
