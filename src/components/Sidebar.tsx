import { NavLink } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { authAtom } from '~root/screens/auth/login/stores';
import { httpClient } from '~root/lib/http-client';
import { Endpoints } from '~root/constants';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-4 py-2 text-sm font-medium ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
  }`;

export const Sidebar = () => {
  const setAuth = useSetAtom(authAtom);

  const handleLogout = () => {
    // Fire the logout call while the token is still in localStorage (the
    // request interceptor reads it synchronously), then clear local state
    // once it settles — clearing first would race the interceptor and send
    // the request with no Authorization header.
    httpClient
      .post(Endpoints.AUTH_LOGOUT)
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
        setAuth(null);
      });
  };

  return (
    <nav className="flex w-56 flex-shrink-0 flex-col gap-1 border-l border-slate-200 bg-white p-4">
      <NavLink to="/dashboard" className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Hồ sơ
      </NavLink>
      <button
        onClick={handleLogout}
        className="mt-4 rounded px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Đăng xuất
      </button>
    </nav>
  );
};
