import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useRegister } from '~root/apis/useRegister';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    mutate(
      { email, password, full_name: fullName },
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Đăng ký</h1>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">Họ và tên</label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2"
        />
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2"
        />
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/auth/login" className="font-medium text-slate-900 underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};
