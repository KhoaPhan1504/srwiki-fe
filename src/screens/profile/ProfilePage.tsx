import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '~root/components/ui/avatar';
import { Button } from '~root/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~root/components/ui/card';
import { Input } from '~root/components/ui/input';
import { Label } from '~root/components/ui/label';
import { Textarea } from '~root/components/ui/textarea';
import { Badge } from '~root/components/ui/badge';
import { Skeleton } from '~root/components/ui/skeleton';
import { PhoneInput } from '~root/components/PhoneInput';
import { OtpModal } from '~root/components/OtpModal';
import { useGetProfile } from '~root/apis/useGetProfile';
import { useUpdateProfile } from '~root/apis/useUpdateProfile';
import { useUploadAvatar } from '~root/apis/useUploadAvatar';
import { profileFormSchema } from '~root/schemas/profile';
import type { ProfileFormValues } from '~root/schemas/profile';

export const ProfilePage = () => {
  const { profile, isLoading } = useGetProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const [phone, setPhone] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (isLoading || !profile) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const initials = (profile.fullName || profile.email).slice(0, 1).toUpperCase();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isUploadingAvatar ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG hoặc WEBP, tối đa 2MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Tiểu sử</Label>
              <Textarea id="bio" rows={3} {...register('bio')} />
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <div className="flex items-center gap-2">
                <PhoneInput value={phone} onChange={setPhone} />
                {profile.phoneVerified && profile.phone === phone ? (
                  <Badge>Đã xác thực</Badge>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOtpModal(true)}
                    disabled={!phone}
                  >
                    Xác thực
                  </Button>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showOtpModal && (
        <OtpModal
          phone={phone}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};
