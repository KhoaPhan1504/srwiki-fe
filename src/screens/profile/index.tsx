import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

export const ProfilePage = () => {
  const { t } = useTranslation('profile');
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

  if (isError) {
    return (
      <div className="max-w-2xl">
        <QueryErrorCard message={t('error')} onRetry={() => refetch()} />
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
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

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
              {isUploadingAvatar ? t('avatar.uploading') : t('avatar.changeButton')}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">{t('avatar.hint')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('form.sectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SrInputGroup formHandler={form} formStructure={formStructure} />
            <div className="flex items-center gap-2">
              {profile.phoneVerified && profile.phone === phone ? (
                <Badge variant={profile.phoneVerified ? 'verify-primary' : 'destructive'}>
                  {t('phone.verified')}
                </Badge>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOtpModal(true)}
                  disabled={!phone}
                >
                  {t('phone.verifyButton')}
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common:buttons.saving') : t('common:buttons.save')}
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
