import { Camera } from 'lucide-react';
import { useProfileHooks } from './hooks';
import { OtpModal, QueryErrorCard } from '~root/components/common';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '~root/components/ui';
import { withCacheBust } from '~root/lib/utils';

const formStructure: SrFormFieldConfig[] = [
  { inputType: 'TextField', name: 'fullName', label: 'Họ và tên', colSpan: 'col-span-12' },
  { inputType: 'TextAreaField', name: 'bio', label: 'Tiểu sử', rows: 3, colSpan: 'col-span-12' },
  { inputType: 'TextField', name: 'address', label: 'Địa chỉ', colSpan: 'col-span-12' },
  { inputType: 'DatePickerField', name: 'dateOfBirth', label: 'Ngày sinh', colSpan: 'col-span-12' },
  { inputType: 'PhoneNumberField', name: 'phone', label: 'Số điện thoại', colSpan: 'col-span-12' },
];

export const ProfilePage = () => {
  const {
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
  } = useProfileHooks();

  if (isError) {
    return (
      <div className="max-w-2xl">
        <QueryErrorCard message="Không thể tải hồ sơ cá nhân." onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Hồ sơ cá nhân</h1>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={withCacheBust(profile.avatarUrl, profile.updatedAt)}
              alt={profile.fullName ?? ''}
            />
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SrInputGroup formHandler={form} formStructure={formStructure} />
            <div className="flex items-center gap-2">
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showOtpModal && (
        <OtpModal
          phone={phone ?? ''}
          onClose={() => setShowOtpModal(false)}
          onVerified={() => setShowOtpModal(false)}
        />
      )}
    </div>
  );
};
