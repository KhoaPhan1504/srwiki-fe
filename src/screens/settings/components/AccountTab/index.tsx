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

const formStructure: SrFormFieldConfig[] = [
  {
    inputType: 'PasswordField',
    name: 'currentPassword',
    label: 'Mật khẩu hiện tại',
    colSpan: 'col-span-12',
  },
  {
    inputType: 'PasswordField',
    name: 'newPassword',
    label: 'Mật khẩu mới',
    colSpan: 'col-span-12',
  },
  {
    inputType: 'PasswordField',
    name: 'confirmPassword',
    label: 'Xác nhận mật khẩu mới',
    colSpan: 'col-span-12',
  },
];

export const AccountTab = () => {
  const { form, onChangePassword, handleDelete, isDeleting } = useSettingHooks();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
            <SrInputGroup formHandler={form} formStructure={formStructure} />
            <Button type="submit">Đổi mật khẩu</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Xoá tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Xoá tài khoản sẽ xoá vĩnh viễn toàn bộ dữ liệu của bạn. Hành động này không thể hoàn
            tác.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? 'Đang xoá...' : 'Xoá tài khoản'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bạn chắc chắn muốn xoá tài khoản?</AlertDialogTitle>
                <AlertDialogDescription>
                  Hành động này không thể hoàn tác. Toàn bộ dữ liệu hồ sơ của bạn sẽ bị xoá vĩnh
                  viễn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Xoá tài khoản</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};
