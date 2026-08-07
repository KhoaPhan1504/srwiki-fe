import { Card, CardContent } from '~root/components/ui/card';
import { Label } from '~root/components/ui/label';
import { Button } from '~root/components/ui/button';
import { useThemePreference } from '~root/providers/useThemePreference';
import type { Theme } from '~root/providers/ThemeProvider';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
  { value: 'system', label: 'Theo hệ thống' },
];

export const AppearanceTab = () => {
  const { theme, setThemePreference } = useThemePreference();

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Label>Giao diện</Label>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={theme === option.value ? 'default' : 'outline'}
              onClick={() => setThemePreference(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
