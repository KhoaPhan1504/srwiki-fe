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
  Input,
  Label,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~root/components/ui';
import { useSettingHooks } from './hooks';

export const AccountTab = () => {
  const { register, handleSubmit, errors, onChangePassword, handleDelete, isDeleting } =
    useSettingHooks();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
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
