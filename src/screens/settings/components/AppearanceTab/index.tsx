import { useTranslation } from 'react-i18next';
import { Card, CardContent, Label, Button } from '~root/components/ui';
import { useThemePreference } from '~root/providers/useThemePreference';
import { Theme } from '~root/constants';

const THEME_OPTIONS: { value: Theme; labelKey: string }[] = [
  { value: Theme.LIGHT, labelKey: 'header:theme.light' },
  { value: Theme.DARK, labelKey: 'header:theme.dark' },
  { value: Theme.SYSTEM, labelKey: 'header:theme.system' },
];

export const AppearanceTab = () => {
  const { t } = useTranslation('settings-appearance');
  const { theme, setThemePreference } = useThemePreference();

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Label>{t('title')}</Label>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={theme === option.value ? 'default' : 'outline'}
              onClick={() => setThemePreference(option.value)}
            >
              {t(option.labelKey)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
