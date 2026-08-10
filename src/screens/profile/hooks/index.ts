import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type ChangeEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '~root/apis';
import { profileFormSchema, type ProfileFormValues } from '~root/schemas';

export const useProfileHooks = () => {
  const { profile, isLoading, isError, refetch } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const [phone, setPhone] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = (profile?.fullName || profile?.email)?.slice(0, 1).toUpperCase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: '', address: '', dateOfBirth: '', bio: '' },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        address: profile.address ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
        bio: profile.bio ?? '',
      });
      // Mirrors PhoneInput's editable local state from the fetched profile; same
      // pattern the previous implementation used for this component's form fields.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(profile.phone ?? '');
    }
  }, [profile, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(
      {
        fullName: values.fullName,
        address: values.address || null,
        dateOfBirth: values.dateOfBirth || null,
        bio: values.bio || null,
      },
      {
        onSuccess: () => toast.success('Đã lưu hồ sơ.', { position: 'bottom-center' }),
        onError: () => toast.error('Lưu hồ sơ thất bại.', { position: 'bottom-center' }),
      },
    );
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadAvatar(file, {
      onSuccess: () => toast.success('Đã cập nhật ảnh đại diện.', { position: 'bottom-center' }),
      onError: () => toast.error('Tải ảnh lên thất bại.', { position: 'bottom-center' }),
    });
    event.target.value = '';
  };

  return {
    profile,
    isLoading,
    isError,
    refetch,
    register,
    handleSubmit,
    errors,
    onSubmit,
    phone,
    setPhone,
    showOtpModal,
    setShowOtpModal,
    fileInputRef,
    handleAvatarChange,
    isPending,
    isUploadingAvatar,
    initials,
  };
};
