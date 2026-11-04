import { zodResolver } from '@hookform/resolvers/zod';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useGetProfile, useUpdateProfile, useUploadAvatar } from '~root/apis';
import { useProfileFormSchema, type ProfileFormValues } from '~root/schemas';
import { getInitials } from '~root/utils';
import type { SrFormFieldConfig } from '~root/components/ui/form/index';

export const useProfileHooks = () => {
  const { t } = useTranslation('profile');
  const { profile, isLoading, isError, refetch } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = getInitials(profile?.fullName, profile?.email);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(useProfileFormSchema()),
    defaultValues: { fullName: '', address: '', dateOfBirth: '', bio: '', phone: '' },
  });
  const { reset, watch } = form;
  const phone = watch('phone');

  const formStructure: SrFormFieldConfig[] = [
    { inputType: 'TextField', name: 'fullName', label: t('form.fullName'), colSpan: 'col-span-12' },
    {
      inputType: 'TextAreaField',
      name: 'bio',
      label: t('form.bio'),
      rows: 3,
      colSpan: 'col-span-12',
    },
    { inputType: 'TextField', name: 'address', label: t('form.address'), colSpan: 'col-span-12' },
    {
      inputType: 'DatePickerField',
      name: 'dateOfBirth',
      label: t('form.dateOfBirth'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'PhoneNumberField',
      name: 'phone',
      label: t('form.phone'),
      colSpan: 'col-span-12',
    },
  ];

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName ?? '',
        address: profile.address ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
        bio: profile.bio ?? '',
        phone: profile.phone ?? '',
      });
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
        onSuccess: () => toast.success(t('saveSuccess'), { position: 'bottom-center' }),
        onError: () => toast.error(t('saveError'), { position: 'bottom-center' }),
      },
    );
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadAvatar(file, {
      onSuccess: () => toast.success(t('avatar.uploadSuccess'), { position: 'bottom-center' }),
      onError: () => toast.error(t('avatar.uploadError'), { position: 'bottom-center' }),
    });
    event.target.value = '';
  };

  return {
    profile,
    isLoading,
    isError,
    refetch,
    form,
    onSubmit,
    phone,
    showOtpModal,
    setShowOtpModal,
    fileInputRef,
    handleAvatarChange,
    isPending,
    isUploadingAvatar,
    initials,
    formStructure,
  };
};
