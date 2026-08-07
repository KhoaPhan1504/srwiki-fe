import { toast } from 'react-toastify';
import { Card, CardContent } from '~root/components/ui/card';
import { Label } from '~root/components/ui/label';
import { Button } from '~root/components/ui/button';
import { useTheme } from '~root/providers/ThemeProvider';
import type { Theme } from '~root/providers/ThemeProvider';
import { useUpdateSettings } from '~root/apis/useUpdateSettings';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
  { value: 'system', label: 'Theo hệ thống' },
];

export const AppearanceTab = () => {
  const { theme, setTheme } = useTheme();
  const { mutate: updateSettings } = useUpdateSettings();

  const handleSelect = (value: Theme) => {
    setTheme(value);
    updateSettings(
      { theme: value },
      { onError: () => toast.error('Lưu giao diện thất bại.', { position: 'bottom-center' }) },
    );
  };

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
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
