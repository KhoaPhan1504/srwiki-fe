import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterHooks } from './hooks';

export const RegisterPage = () => {
  const { t } = useTranslation('auth');
  const { email, setEmail, password, setPassword, fullName, setFullName, handleSubmit, isPending } =
    useRegisterHooks();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">{t('register.title')}</h1>
        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
          {t('register.fullNameLabel')}
        </label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2"
        />
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          {t('register.emailLabel')}
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
          {t('register.passwordLabel')}
        </label>
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
          {isPending ? t('register.submitting') : t('register.submit')}
        </button>
        <p className="mt-4 text-center text-sm text-slate-600">
          {t('register.hasAccount')}{' '}
          <Link to="/auth/login" className="font-medium text-slate-900 underline">
            {t('register.loginLink')}
          </Link>
        </p>
      </form>
    </div>
  );
};
