import { zodResolver } from '@hookform/resolvers/zod';
import { useSetAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useDeleteAccount } from '~root/apis';
import { queryClient } from '~root/lib/query-client';
import { useChangePasswordSchema, type ChangePasswordValues } from '~root/schemas';
import { authAtom } from '~root/stores';

export const useSettingHooks = () => {
  const { t } = useTranslation('settings-account');
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const form = useForm<ChangePasswordValues>({ resolver: zodResolver(useChangePasswordSchema()) });
  const { reset } = form;

  const onChangePassword = () => {
    toast.info(t('changePassword.comingSoon'), { position: 'bottom-center' });
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
      onError: () => toast.error(t('deleteAccount.error'), { position: 'bottom-center' }),
    });
  };

  return { form, onChangePassword, handleDelete, isDeleting };
};
