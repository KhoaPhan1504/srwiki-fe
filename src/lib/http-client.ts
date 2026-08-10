import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { API_URL, Endpoints } from '~root/constants';
import { isJsonString } from '~root/utils';
import { authAtom, localStore } from '~root/stores';

export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 29000,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = localStorage.getItem('auth');
    const token = auth && isJsonString(auth) ? JSON.parse(auth)?.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRedirecting = false;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  if (!isRedirecting) {
    isRedirecting = true;
    toast.error('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.', {
      position: 'bottom-center',
      toastId: 'UNAUTHORIZED_ERROR',
    });
    setTimeout(() => {
      localStorage.removeItem('auth');
      localStorage.removeItem('refreshToken');
      localStore.set(authAtom, null);
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `/auth/login${currentUrl ? `?callbackUrl=${encodeURIComponent(currentUrl)}` : ''}`;
    }, 1000);
    setTimeout(() => {
      isRedirecting = false;
    }, 5000);
  }
};

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ errorCode?: string }>) => {
    const isAuthPage = window.location.pathname.startsWith('/auth/login');
    const isAccessRemovedPage = window.location.pathname.startsWith('/auth/access-removed');
    const status = error.response?.status;

    if (status === 401 && !isAuthPage) {
      const originalRequest = error.config!;
      const currentAuth = localStorage.getItem('auth');

      if (!currentAuth) {
        if (!isAccessRemovedPage) redirectToLogin();
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes(Endpoints.AUTH_REFRESH)) {
        if (!isAccessRemovedPage) redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        httpClient
          .post(Endpoints.AUTH_REFRESH, {
            ...(storedRefreshToken && { refreshToken: storedRefreshToken }),
          })
          .then(({ data }) => {
            const newToken = data.token;
            const auth = localStorage.getItem('auth');
            if (!auth) {
              processQueue(new Error('User logged out'), null);
              reject(new Error('User logged out'));
              return;
            }
            if (isJsonString(auth)) {
              const authData = JSON.parse(auth);
              authData.token = newToken;
              localStorage.setItem('auth', JSON.stringify(authData));
              localStore.set(authAtom, authData);
            }
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            resolve(httpClient(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            if (!isAccessRemovedPage) redirectToLogin();
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    if (status === 403 && !isAuthPage && !isAccessRemovedPage) {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 'NOT_AUTHORIZED_TO_USE_APPLICATION') {
        if (!isRedirecting) {
          isRedirecting = true;
          localStorage.setItem('accessRemoved', 'true');
          setTimeout(() => {
            window.location.href = '/auth/access-removed';
          }, 100);
          setTimeout(() => {
            isRedirecting = false;
          }, 5000);
        }
        return Promise.reject(error);
      }
      toast.error('Bạn không có quyền truy cập tài nguyên này!', {
        position: 'bottom-center',
        toastId: 'FORBIDDEN_ERROR',
      });
    }

    return Promise.reject(error);
  },
);
