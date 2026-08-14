import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { authAtom } from '~root/stores';
import { useGetMembers } from '~root/apis';
import { useAdminMembersFilters } from './hooks';
import { MembersTable } from './components/MembersTable';

const PAGE_SIZE = 20;

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const { appliedFilters, page, setPage } = useAdminMembersFilters();
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
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
    </div>
  );
};
