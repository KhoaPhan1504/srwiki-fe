import { CommandIcon, Menu, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~root/components/ui';
import { LanguageSwitch, NotificationBell, UserMenu } from './components';
type Props = { onMenuClick: () => void; onOpenPalette: () => void };

export const Header = ({ onMenuClick, onOpenPalette }: Props) => {
  const { t } = useTranslation('header');

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex flex-1 justify-center sm:justify-start">
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label={t('search.ariaLabel')}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted/50 px-3 text-muted-foreground transition-colors hover:bg-muted sm:w-full sm:max-w-[400px] sm:justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden truncate text-sm sm:inline">{t('search.placeholder')}</span>
          </div>
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="shrink-0 rounded border bg-background px-1.5 py-1.5 text-sm font-medium">
              <CommandIcon className="h-3 w-3" />
            </kbd>
            +
            <kbd className="shrink-0 rounded border bg-background px-2 py-0.5 text-sm font-medium">
              K
            </kbd>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <LanguageSwitch />
        <UserMenu />
      </div>
    </header>
  );
};
