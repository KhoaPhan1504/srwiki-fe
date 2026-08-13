import { useTranslation } from 'react-i18next';
import { TIMEZONES } from '~root/constants';
import { useGeneralTabForm, useGeneralTabQuery } from './hooks';
import { QueryErrorCard } from '~root/components/common';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { Button, Card, CardContent, Skeleton } from '~root/components/ui';
import type { Settings } from '~root/apis';

// Only mounted once `settings` has already loaded, so the form's
// defaultValues are seeded with the real fetched values on the very first
// render -- see useGeneralTabForm for why this matters.
const GeneralTabForm = ({ settings }: { settings: Settings }) => {
  const { t } = useTranslation('settings-general');
  const { form, onSubmit, isPending } = useGeneralTabForm(settings);

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'SelectField',
      name: 'language',
      label: t('language'),
      colSpan: 'col-span-12',
      items: [
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'en', label: 'English' },
      ],
    },
    {
      inputType: 'SelectField',
      name: 'timezone',
      label: t('timezone'),
      colSpan: 'col-span-12',
      items: TIMEZONES.map((tz) => ({ value: tz, label: tz })),
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <SrInputGroup formHandler={form} formStructure={formStructure} />
          <Button type="submit" disabled={isPending}>
            {isPending ? t('common:buttons.saving') : t('common:buttons.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export const GeneralTab = () => {
  const { t } = useTranslation('settings-general');
  const { settings, isLoading, isError, refetch } = useGeneralTabQuery();

  if (isError) {
    return <QueryErrorCard message={t('error')} onRetry={() => refetch()} />;
  }

  if (isLoading || !settings) {
    return <Skeleton className="h-48" />;
  }

  return <GeneralTabForm settings={settings} />;
};
