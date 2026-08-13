import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~root/components/ui';
import { SrInputGroup, type SrFormFieldConfig } from '~root/components/ui/form/index';
import { useSettingHooks } from './hooks';

export const AccountTab = () => {
  const { t } = useTranslation('settings-account');
  const { form, onChangePassword, handleDelete, isDeleting } = useSettingHooks();

  const formStructure: SrFormFieldConfig[] = [
    {
      inputType: 'PasswordField',
      name: 'currentPassword',
      label: t('changePassword.currentPassword'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'PasswordField',
      name: 'newPassword',
      label: t('changePassword.newPassword'),
      colSpan: 'col-span-12',
    },
    {
      inputType: 'PasswordField',
      name: 'confirmPassword',
      label: t('changePassword.confirmPassword'),
      colSpan: 'col-span-12',
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('changePassword.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
            <SrInputGroup formHandler={form} formStructure={formStructure} />
            <Button type="submit">{t('changePassword.submit')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t('deleteAccount.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('deleteAccount.description')}</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? t('deleteAccount.deleting') : t('deleteAccount.button')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteAccount.confirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteAccount.confirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  {t('deleteAccount.button')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
