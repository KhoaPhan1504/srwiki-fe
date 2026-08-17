import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2, UserMinus } from 'lucide-react';
import {
  TableCustom,
  Badge,
  Button,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  type ColumnType,
  type FilterValue,
  type SortState,
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
  sort: SortState | null;
  filters: Record<string, FilterValue>;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SortState | null) => void;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
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
  sort,
  filters,
  onRetry,
  onPageChange,
  onSortChange,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
  onDemote,
}: Props) => {
  const { t } = useTranslation('admin-members');

  if (isError) {
    return <QueryErrorCard message={t('adminsTable.error')} onRetry={onRetry} />;
  }

  const columns: ColumnType<Admin>[] = [
    {
      key: 'stt',
      header: '#',
      pinned: 'left',
      hideable: false,
      render: (_row, index) => (page - 1) * pageSize + index + 1,
    },
    {
      key: 'fullName',
      header: t('adminsTable.columns.name'),
      accessor: (row) => row.fullName ?? '—',
      sortable: true,
    },
    { key: 'email', header: t('adminsTable.columns.email'), accessor: 'email', sortable: true },
    {
      key: 'role',
      header: t('adminsTable.columns.role'),
      render: (row) => <Badge variant="outline">{t(`adminsTable.role.${row.role}`)}</Badge>,
    },
    {
      key: 'address',
      header: t('adminsTable.columns.address'),
      accessor: (row) => row.address ?? '—',
      filter: { type: 'text' },
    },
    {
      key: 'createdAt',
      header: t('adminsTable.columns.createdAt'),
      accessor: (row) => formatDate(row.createdAt),
      sortable: true,
      filter: { type: 'dateRange' },
    },
    {
      key: 'actions',
      header: t('adminsTable.columns.actions'),
      align: 'right',
      pinned: 'right',
      hideable: false,
      render: (admin) => (
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
      ),
    },
  ];

  return (
    <TableCustom<Admin>
      columns={columns}
      data={admins}
      rowKey="id"
      isLoading={isLoading}
      emptyMessage={t('adminsTable.empty')}
      pagination={{ page, pageSize, total, onPageChange }}
      sort={sort}
      onSortChange={onSortChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
    />
  );
};
