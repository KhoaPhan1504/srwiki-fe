import { Badge, Camera } from 'lucide-react';
import { useProfileHooks } from './hooks';
import { OtpModal, PhoneInput, QueryErrorCard } from '~root/components/common';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Textarea,
} from '~root/components/ui';
import { withCacheBust } from '~root/lib/utils';

export const ProfilePage = () => {
  const {
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
