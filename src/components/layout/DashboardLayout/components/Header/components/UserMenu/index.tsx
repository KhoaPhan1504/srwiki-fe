import { useNavigate } from 'react-router-dom';
import { LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from '~root/components/ui';
import { withCacheBust } from '~root/lib/utils';
import { useLogout, useGetProfile } from '~root/apis';
import { getInitials, getRoleLabel } from '~root/utils';

export const UserMenu = () => {
  const { t } = useTranslation('header');
  const { profile } = useGetProfile();
  const navigate = useNavigate();
  const logout = useLogout();

  const initials = getInitials(profile?.fullName, profile?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={withCacheBust(profile?.avatarUrl, profile?.updatedAt)}
              alt={profile?.fullName ?? ''}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start leading-tight max-w-40">
            <span className="hidden text-sm font-medium sm:inline">{profile?.fullName}</span>
            <Badge variant="secondary" className="hidden sm:inline">
              {getRoleLabel(profile?.role)}
            </Badge>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[200px] truncate">
          {profile?.fullName || profile?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" /> {t('nav.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" /> {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
