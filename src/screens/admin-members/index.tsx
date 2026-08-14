import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { Filter as FilterIcon, Plus } from 'lucide-react';
import { Button } from '~root/components/ui';
import { authAtom } from '~root/stores';
import { useGetMembers, useGetSettings } from '~root/apis';
import { useAdminMembersFilters, countActiveFilterGroups } from './hooks';
import { MembersTable } from './components/MembersTable';
import { FilterSheet } from './components/FilterSheet';
import { TimezoneSwitch } from './components/TimezoneSwitch';
import { CreateMemberDialog } from './components/CreateMemberDialog';
import { toCreatedAtFromIso, toCreatedAtToIso } from './utils';

const PAGE_SIZE = 20;

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const { appliedFilters, page, applyFilters, clearFilters, setPage } = useAdminMembersFilters();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { settings } = useGetSettings();
  const timezoneMode: 'UTC' | 'local' = settings?.timezone === 'UTC' ? 'UTC' : 'local';
  const { data, isLoading, isError, refetch } = useGetMembers({
    page,
    pageSize: PAGE_SIZE,
    membershipTier: appliedFilters.membershipTier.join(',') || undefined,
    createdAtFrom: appliedFilters.createdAtFrom
      ? toCreatedAtFromIso(appliedFilters.createdAtFrom, timezoneMode)
      : undefined,
    createdAtTo: appliedFilters.createdAtTo
      ? toCreatedAtToIso(appliedFilters.createdAtTo, timezoneMode)
      : undefined,
    address: appliedFilters.address || undefined,
    birthdayFrom: appliedFilters.birthdayFrom || undefined,
    birthdayTo: appliedFilters.birthdayTo || undefined,
  });
  const activeFilterCount = countActiveFilterGroups(appliedFilters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
        <div className="flex items-center gap-2">
          <TimezoneSwitch />
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            <FilterIcon className="mr-2 h-4 w-4" />
            {activeFilterCount > 0
              ? `${t('filterButton')} (${activeFilterCount})`
              : t('filterButton')}
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createButton')}
          </Button>
        </div>
      </div>

      <MembersTable
        members={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        currentUserId={auth?.user.id ?? ''}
        onRetry={() => refetch()}
        onPageChange={setPage}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        appliedFilters={appliedFilters}
        onApply={applyFilters}
        onClearAll={clearFilters}
      />
      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
};
