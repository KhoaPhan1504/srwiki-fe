import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLogin } from '~root/apis';

export const useLoginHooks = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mutate, isPending } = useLogin();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutate(
      { email, password },
      {
        onSuccess: () => {
          const callbackUrl = searchParams.get('callbackUrl');
          navigate(callbackUrl || '/dashboard', { replace: true });
        },
        onError: () => {
          toast.error('Email hoặc mật khẩu không đúng.', { position: 'bottom-center' });
        },
      },
    );
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    isPending,
  };
};
