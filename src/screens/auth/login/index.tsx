import { Link } from 'react-router-dom';
import { useLoginHooks } from './hooks';

export const LoginPage = () => {
  const { email, setEmail, password, setPassword, handleSubmit, isPending } = useLoginHooks();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Đăng nhập</h1>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2"
        />
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link to="/auth/register" className="font-medium text-slate-900 underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
};
