import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { PhoneInput } from '~root/components/PhoneInput';
import { OtpModal } from '~root/components/OtpModal';
import { useGetProfile } from '~root/apis/useGetProfile';
import { useUpdateProfile } from '~root/apis/useUpdateProfile';
import { authAtom } from '~root/screens/auth/login/stores';
import { useDeleteAccount } from '~root/apis/useDeleteAccount';

export const ProfilePage = () => {
  const { profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const navigate = useNavigate();
  const setAuth = useSetAtom(authAtom);
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    // Re-seed local form state whenever the fetched profile changes (initial
    // load and refetch after a save), so edits always start from the latest
    // server values without overwriting the fields on every keystroke.
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFullName(profile.fullName ?? '');
      setAddress(profile.address ?? '');
      setDateOfBirth(profile.dateOfBirth ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    updateProfile(
      { fullName, address, dateOfBirth: dateOfBirth || null },
      {
        onSuccess: () => toast.success('Đã lưu hồ sơ.', { position: 'bottom-center' }),
        onError: () => toast.error('Lưu hồ sơ thất bại.', { position: 'bottom-center' }),
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Bạn chắc chắn muốn xoá tài khoản? Hành động này không thể hoàn tác.')) {
      return;
    }
    deleteAccount(undefined, {
      onSuccess: () => {
        localStorage.removeItem('auth');
        localStorage.removeItem('refreshToken');
        setAuth(null);
        navigate('/auth/login', { replace: true });
      },
      onError: () => toast.error('Xoá tài khoản thất bại.', { position: 'bottom-center' }),
    });
  };

  if (isLoading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Hồ sơ cá nhân</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
            Họ và tên
          </label>
          <input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
            Địa chỉ
          </label>
          <input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="mb-1 block text-sm font-medium text-slate-700">
            Ngày sinh
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
          <div className="flex items-center gap-2">
            <PhoneInput value={phone} onChange={setPhone} />
            {profile?.phoneVerified && profile.phone === phone ? (
              <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                Đã xác thực
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowOtpModal(true)}
                disabled={!phone}
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40"
              >
                Xác thực
              </button>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </button>
      </form>
      <div className="mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="mb-2 text-sm text-red-700">
          Xoá tài khoản sẽ xoá vĩnh viễn toàn bộ dữ liệu của bạn.
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isDeleting ? 'Đang xoá...' : 'Xoá tài khoản'}
        </button>
      </div>
      {showOtpModal && (
        <OtpModal
          phone={phone}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => setShowOtpModal(false)}
        />
      )}
    </main>
  );
};
