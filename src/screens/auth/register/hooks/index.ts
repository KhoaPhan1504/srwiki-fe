import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useRegister } from '~root/apis';

export const useRegisterHooks = () => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutate(
      { email, password, fullName },
      {
        onSuccess: () => {
          toast.success(t('register.success'), { position: 'bottom-center' });
          navigate('/auth/login', { replace: true });
        },
        onError: () => {
          toast.error(t('register.error'), { position: 'bottom-center' });
        },
      },
    );
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    handleSubmit,
    isPending,
  };
};
