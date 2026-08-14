import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { Filter as FilterIcon } from 'lucide-react';
import { Button } from '~root/components/ui';
import { authAtom } from '~root/stores';
import { useGetMembers } from '~root/apis';
import { useAdminMembersFilters, countActiveFilterGroups } from './hooks';
import { MembersTable } from './components/MembersTable';
import { FilterSheet } from './components/FilterSheet';

const PAGE_SIZE = 20;

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const { appliedFilters, page, applyFilters, clearFilters, setPage } = useAdminMembersFilters();
  const [filterOpen, setFilterOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useGetMembers({
    page,
    pageSize: PAGE_SIZE,
    membershipTier: appliedFilters.membershipTier.join(',') || undefined,
    createdAtFrom: appliedFilters.createdAtFrom || undefined,
    createdAtTo: appliedFilters.createdAtTo || undefined,
    address: appliedFilters.address || undefined,
    birthdayFrom: appliedFilters.birthdayFrom || undefined,
    birthdayTo: appliedFilters.birthdayTo || undefined,
  });
  const activeFilterCount = countActiveFilterGroups(appliedFilters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
        <Button variant="outline" onClick={() => setFilterOpen(true)}>
          <FilterIcon className="mr-2 h-4 w-4" />
          {activeFilterCount > 0
            ? `${t('filterButton')} (${activeFilterCount})`
            : t('filterButton')}
        </Button>
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
    </div>
  );
};
