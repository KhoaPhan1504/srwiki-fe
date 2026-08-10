import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from './components/Header';
import { MenuVertical } from './components/MenuVertical';
import { useGetSettings } from '~root/apis/useGetSettings';
import { useTheme } from '~root/providers/ThemeProvider';

interface Props {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: Props) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings } = useGetSettings();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (settings && settings.theme !== theme) {
      setTheme(settings.theme);
    }
    // Only re-run when the server value changes — a local toggle shouldn't get
    // immediately overwritten by this effect re-firing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  return (
    <div className="flex min-h-screen bg-background">
      <MenuVertical mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
