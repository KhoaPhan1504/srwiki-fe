import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDeleteAccount } from '~root/apis';
import { queryClient } from '~root/lib/query-client';
import { changePasswordSchema, type ChangePasswordValues } from '~root/schemas';
import { authAtom } from '~root/stores';

export const useSettingHooks = () => {
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const form = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });
  const { reset } = form;

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

  return { form, onChangePassword, handleDelete, isDeleting };
};
