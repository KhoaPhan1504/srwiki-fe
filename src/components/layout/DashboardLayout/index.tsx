import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { MenuVertical } from './components/MenuVertical';
import { CommandPalette } from './components/CommandPalette';
import { useGetSettings } from '~root/apis/useGetSettings';
import { useTheme } from '~root/providers/ThemeProvider';

interface Props {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: Props) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { settings } = useGetSettings();
  const { theme, setTheme } = useTheme();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (settings && settings.theme !== theme) {
      setTheme(settings.theme);
    }
    // Only re-run when the server value changes — a local toggle shouldn't get
    // immediately overwritten by this effect re-firing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    if (settings && settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
    // Same reasoning as the theme effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <MenuVertical mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
};
