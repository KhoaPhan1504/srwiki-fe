import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2, UserMinus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~root/components/ui';
import { QueryErrorCard } from '~root/components/common';
import { formatDate } from '~root/utils';
import type { Admin } from '~root/apis';

type Props = {
  admins: Admin[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  canManage: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onView: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  onDemote: (admin: Admin) => void;
};

export const AdminsTable = ({
  admins,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  canManage,
  onRetry,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onDemote,
}: Props) => {
  const { t } = useTranslation('admin-members');

  if (isError) {
    return <QueryErrorCard message={t('adminsTable.error')} onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('adminsTable.columns.name')}</TableHead>
            <TableHead>{t('adminsTable.columns.email')}</TableHead>
            <TableHead>{t('adminsTable.columns.role')}</TableHead>
            <TableHead>{t('adminsTable.columns.address')}</TableHead>
            <TableHead>{t('adminsTable.columns.createdAt')}</TableHead>
            <TableHead className="text-right">{t('adminsTable.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                {t('adminsTable.empty')}
              </TableCell>
            </TableRow>
          )}
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.fullName ?? '—'}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{t(`adminsTable.role.${admin.role}`)}</Badge>
              </TableCell>
              <TableCell>{admin.address ?? '—'}</TableCell>
              <TableCell>{formatDate(admin.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('viewAdmin.title')}
                    onClick={() => onView(admin)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('editAdmin.title')}
                        onClick={() => onEdit(admin)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t('demote.button')}>
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('demote.confirmTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('demote.confirmDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDemote(admin)}>
                              {t('demote.button')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t('deleteAdmin.button')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('deleteAdmin.confirmTitle')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteAdmin.confirmDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(admin)}>
                              {t('deleteAdmin.button')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t('pagination.pageInfo', { page, totalPages })}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t('pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t('pagination.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};
