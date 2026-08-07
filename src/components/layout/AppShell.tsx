import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '~root/components/layout/AppSidebar';
import { AppHeader } from '~root/components/layout/AppHeader';
import { useGetSettings } from '~root/apis/useGetSettings';
import { useTheme } from '~root/providers/ThemeProvider';

export const AppShell = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings } = useGetSettings();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (settings && settings.theme !== theme) {
      setTheme(settings.theme);
    }
    // Only re-run when the server value changes — `theme`/`setTheme` intentionally
    // excluded so a local toggle (Task 6/10) doesn't get immediately overwritten
    // by this effect re-firing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
