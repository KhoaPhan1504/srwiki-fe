import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2, UserMinus } from 'lucide-react';
import {
  TableCustom,
  TableAction,
  Badge,
  type ColumnType,
  type FilterValue,
  type SortState,
  type TableActionItem,
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
      render: (admin) => {
        const items: TableActionItem[] = [
          {
            key: 'view',
            label: t('viewAdmin.title'),
            icon: Eye,
            onSelect: () => onView(admin),
          },
          ...(canManage
            ? [
                {
                  key: 'edit',
                  label: t('editAdmin.title'),
                  icon: Pencil,
                  onSelect: () => onEdit(admin),
                },
                {
                  key: 'demote',
                  label: t('demote.button'),
                  icon: UserMinus,
                  onSelect: () => onDemote(admin),
                  confirm: {
                    title: t('demote.confirmTitle'),
                    description: t('demote.confirmDescription'),
                    confirmLabel: t('demote.button'),
                    cancelLabel: t('common:buttons.cancel'),
                  },
                },
                {
                  key: 'delete',
                  label: t('deleteAdmin.button'),
                  icon: Trash2,
                  variant: 'destructive' as const,
                  onSelect: () => onDelete(admin),
                  confirm: {
                    title: t('deleteAdmin.confirmTitle'),
                    description: t('deleteAdmin.confirmDescription'),
                    confirmLabel: t('deleteAdmin.button'),
                    cancelLabel: t('common:buttons.cancel'),
                  },
                },
              ]
            : []),
        ];
        return <TableAction items={items} triggerLabel={t('adminsTable.columns.actions')} />;
      },
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
