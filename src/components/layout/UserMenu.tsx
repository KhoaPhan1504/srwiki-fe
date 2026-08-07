import { useNavigate } from 'react-router-dom';
import { LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~root/components/ui/avatar';
import { withCacheBust } from '~root/lib/utils';
import { useGetProfile } from '~root/apis/useGetProfile';
import { useLogout } from '~root/apis/useLogout';

export const UserMenu = () => {
  const { profile } = useGetProfile();
  const navigate = useNavigate();
  const logout = useLogout();

  const initials = (profile?.fullName ?? profile?.email ?? '?').slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={withCacheBust(profile?.avatarUrl, profile?.updatedAt)}
              alt={profile?.fullName ?? ''}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[200px] truncate">
          {profile?.fullName || profile?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" /> Hồ sơ
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon className="mr-2 h-4 w-4" /> Cài đặt
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
