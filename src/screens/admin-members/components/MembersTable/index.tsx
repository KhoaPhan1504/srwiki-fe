import { useTranslation } from 'react-i18next';
import { Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
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
  sort: SortState | null;
  filters: Record<string, FilterValue>;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onSortChange: (sort: SortState | null) => void;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
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
  sort,
  filters,
  onRetry,
  onPageChange,
  onSortChange,
  onFiltersChange,
  onView,
  onEdit,
  onDelete,
  onPromote,
}: Props) => {
  const { t } = useTranslation('admin-members');

  if (isError) {
    return <QueryErrorCard message={t('table.error')} onRetry={onRetry} />;
  }

  const columns: ColumnType<Member>[] = [
    {
      key: 'fullName',
      header: t('table.columns.name'),
      accessor: (row) => row.fullName ?? '—',
      sortable: true,
    },
    { key: 'email', header: t('table.columns.email'), accessor: 'email', sortable: true },
    {
      key: 'role',
      header: t('table.columns.role'),
      render: (row) => <Badge variant="outline">{t(`table.role.${row.role}`)}</Badge>,
    },
    {
      key: 'membershipTier',
      header: t('table.columns.membershipTier'),
      render: (row) =>
        row.membershipTier ? (
          <Badge variant={row.membershipTier === MembershipTier.VIP ? 'default' : 'secondary'}>
            {t(`table.membershipTier.${row.membershipTier}`)}
          </Badge>
        ) : (
          t('table.membershipTier.none')
        ),
      filter: {
        type: 'multiSelect',
        options: [
          { value: MembershipTier.REGULAR, label: t('table.membershipTier.regular') },
          { value: MembershipTier.VIP, label: t('table.membershipTier.vip') },
        ],
      },
    },
    {
      key: 'address',
      header: t('table.columns.address'),
      accessor: (row) => row.address ?? '—',
      filter: { type: 'text' },
    },
    {
      key: 'birthday',
      header: t('table.columns.birthday'),
      accessor: (row) => (row.dateOfBirth ? formatDate(row.dateOfBirth) : '—'),
      filter: { type: 'dateRange' },
    },
    {
      key: 'createdAt',
      header: t('table.columns.createdAt'),
      accessor: (row) => formatDate(row.createdAt),
      sortable: true,
      filter: { type: 'dateRange' },
    },
    {
      key: 'actions',
      header: t('table.columns.actions'),
      align: 'right',
      pinned: 'right',
      hideable: false,
      render: (member) => {
        const items: TableActionItem[] = [
          { key: 'view', label: t('view.title'), icon: Eye, onSelect: () => onView(member) },
          { key: 'edit', label: t('edit.title'), icon: Pencil, onSelect: () => onEdit(member) },
          ...(canPromote
            ? [
                {
                  key: 'promote',
                  label: t('promote.button'),
                  icon: UserPlus,
                  onSelect: () => onPromote(member),
                  confirm: {
                    title: t('promote.confirmTitle'),
                    description: t('promote.confirmDescription'),
                    confirmLabel: t('promote.button'),
                    cancelLabel: t('common:buttons.cancel'),
                  },
                },
              ]
            : []),
          {
            key: 'delete',
            label: t('delete.button'),
            icon: Trash2,
            variant: 'destructive',
            disabled: member.id === currentUserId,
            onSelect: () => onDelete(member),
            confirm: {
              title: t('delete.confirmTitle'),
              description: t('delete.confirmDescription'),
              confirmLabel: t('delete.button'),
              cancelLabel: t('common:buttons.cancel'),
            },
          },
        ];
        return <TableAction items={items} triggerLabel={t('table.columns.actions')} />;
      },
    },
  ];

  return (
    <TableCustom<Member>
      columns={columns}
      data={members}
      rowKey="id"
      isLoading={isLoading}
      emptyMessage={t('table.empty')}
      pagination={{ page, pageSize, total, onPageChange }}
      sort={sort}
      onSortChange={onSortChange}
      filters={filters}
      onFiltersChange={onFiltersChange}
    />
  );
};
