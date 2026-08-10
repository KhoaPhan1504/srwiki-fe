import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRegister } from '~root/apis';

export const useRegisterHooks = () => {
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
          toast.success('Đăng ký thành công! Vui lòng đăng nhập.', { position: 'bottom-center' });
          navigate('/auth/login', { replace: true });
        },
        onError: () => {
          toast.error('Đăng ký thất bại. Email có thể đã được sử dụng.', {
            position: 'bottom-center',
          });
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
