import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { authAtom } from '~root/stores';
import { useGetMembers } from '~root/apis';
import { MembersTable } from './components/MembersTable';

const PAGE_SIZE = 20;

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const { data, isLoading, isError, refetch } = useGetMembers({ page: 1, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('pageTitle')}</h1>
      <MembersTable
        members={data?.items ?? []}
        total={data?.total ?? 0}
        page={1}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        isError={isError}
        currentUserId={auth?.user.id ?? ''}
        onRetry={() => refetch()}
        onPageChange={() => {}}
        onView={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};
