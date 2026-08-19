import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { Button } from '~root/components/ui/button';
import { useLanguagePreference } from '~root/providers/useLanguagePreference';
import { Language } from '~root/constants';

export const LanguageSwitch = () => {
  const { t } = useTranslation('header');
  const { language, setLanguagePreference } = useLanguagePreference();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1.5 px-2" aria-label={t('languageSwitch.ariaLabel')}>
          <span>{language === Language.VI ? '🇻🇳' : '🇬🇧'}</span>
          <span className="hidden sm:inline">
            {language === Language.VI ? t('language.vi') : t('language.en')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguagePreference(Language.VI)}>
          🇻🇳 {t('language.vi')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguagePreference(Language.EN)}>
          🇬🇧 {t('language.en')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
