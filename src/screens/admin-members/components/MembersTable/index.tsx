import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
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
import type { Member } from '~root/apis';
import { MembershipTier } from '~root/constants';

type Props = {
  members: Member[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  currentUserId: string;
  canPromote: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onPromote: (member: Member) => void;
};

export const MembersTable = ({
  members,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  currentUserId,
  canPromote,
  onRetry,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onPromote,
}: Props) => {
  const { t } = useTranslation('admin-members');

  if (isError) {
    return <QueryErrorCard message={t('table.error')} onRetry={onRetry} />;
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
            <TableHead>{t('table.columns.name')}</TableHead>
            <TableHead>{t('table.columns.email')}</TableHead>
            <TableHead>{t('table.columns.role')}</TableHead>
            <TableHead>{t('table.columns.membershipTier')}</TableHead>
            <TableHead>{t('table.columns.address')}</TableHead>
            <TableHead>{t('table.columns.birthday')}</TableHead>
            <TableHead>{t('table.columns.createdAt')}</TableHead>
            <TableHead className="text-right">{t('table.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                {t('table.empty')}
              </TableCell>
            </TableRow>
          )}
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.fullName ?? '—'}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{t(`table.role.${member.role}`)}</Badge>
              </TableCell>
              <TableCell>
                {member.membershipTier ? (
                  <Badge
                    variant={member.membershipTier === MembershipTier.VIP ? 'default' : 'secondary'}
                  >
                    {t(`table.membershipTier.${member.membershipTier}`)}
                  </Badge>
                ) : (
                  t('table.membershipTier.none')
                )}
              </TableCell>
              <TableCell>{member.address ?? '—'}</TableCell>
              <TableCell>{member.dateOfBirth ? formatDate(member.dateOfBirth) : '—'}</TableCell>
              <TableCell>{formatDate(member.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('view.title')}
                    onClick={() => onView(member)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('edit.title')}
                    onClick={() => onEdit(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canPromote && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={t('promote.button')}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('promote.confirmTitle')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('promote.confirmDescription')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onPromote(member)}>
                            {t('promote.button')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('delete.button')}
                        disabled={member.id === currentUserId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete.confirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('delete.confirmDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common:buttons.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(member)}>
                          {t('delete.button')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
