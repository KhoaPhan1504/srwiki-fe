import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui/card';
import { Input } from '~root/components/ui/input';
import { Label } from '~root/components/ui/label';
import { Button } from '~root/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~root/components/ui/alert-dialog';
import { useDeleteAccount } from '~root/apis/useDeleteAccount';
import { queryClient } from '~root/lib/query-client';
import { authAtom } from '~root/screens/auth/login/stores';
import { changePasswordSchema } from '~root/schemas/settings';
import type { ChangePasswordValues } from '~root/schemas/settings';

export const AccountTab = () => {
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  const onChangePassword = () => {
    toast.info('Tính năng đổi mật khẩu sẽ sớm ra mắt.', { position: 'bottom-center' });
    reset();
  };

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
        setAuth(null);
        // Prevents the next user to log in on this tab from briefly seeing
        // this (now-deleted) account's cached profile/settings.
        queryClient.clear();
        navigate('/auth/login', { replace: true });
      },
      onError: () => toast.error('Xoá tài khoản thất bại.', { position: 'bottom-center' }),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit">Đổi mật khẩu</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Xoá tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Xoá tài khoản sẽ xoá vĩnh viễn toàn bộ dữ liệu của bạn. Hành động này không thể hoàn
            tác.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? 'Đang xoá...' : 'Xoá tài khoản'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn chắc chắn muốn xoá tài khoản?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Toàn bộ dữ liệu hồ sơ của bạn sẽ bị xoá vĩnh
                  viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Xoá tài khoản</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
