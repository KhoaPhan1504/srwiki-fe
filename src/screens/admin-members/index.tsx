import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { Filter as FilterIcon, Plus } from 'lucide-react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import { authAtom } from '~root/stores';
import {
  useDeleteAdmin,
  useDeleteMember,
  useDemoteAdmin,
  useGetAdmins,
  useGetMembers,
  useGetSettings,
  usePromoteMember,
} from '~root/apis';
import { useAdminMembersFilters, countActiveFilterGroups } from './hooks';
import { MembersTable } from './components/MembersTable';
import { AdminsTable } from './components/AdminsTable';
import { FilterSheet } from './components/FilterSheet';
import { TimezoneSwitch } from './components/TimezoneSwitch';
import { CreateMemberDialog } from './components/CreateMemberDialog';
import { MemberFormDialog } from './components/MemberFormDialog';
import { CreateAdminDialog } from './components/CreateAdminDialog';
import { AdminFormDialog } from './components/AdminFormDialog';
import { toCreatedAtFromIso, toCreatedAtToIso } from './utils';
import type { Admin, Member } from '~root/apis';

const PAGE_SIZE = 20;
const VALID_TABS = ['members', 'admins'] as const;
type AdminMembersTab = (typeof VALID_TABS)[number];

const isValidTab = (value: string | null): value is AdminMembersTab =>
  !!value && (VALID_TABS as readonly string[]).includes(value);

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const isSuperAdmin = auth?.user.role === 'super_admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: AdminMembersTab = isValidTab(searchParams.get('tab'))
    ? (searchParams.get('tab') as AdminMembersTab)
    : 'members';

  const { appliedFilters, page, applyFilters, clearFilters, setPage } = useAdminMembersFilters();
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { settings } = useGetSettings();
  const { mutate: deleteMember } = useDeleteMember();
  const { mutate: promoteMember } = usePromoteMember();
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

  const [adminPage, setAdminPage] = useState(1);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const { mutate: deleteAdmin } = useDeleteAdmin();
  const { mutate: demoteAdmin } = useDemoteAdmin();
  const {
    data: adminsData,
    isLoading: isAdminsLoading,
    isError: isAdminsError,
    refetch: refetchAdmins,
  } = useGetAdmins({ page: adminPage, pageSize: PAGE_SIZE });

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => setSearchParams({ tab: value })}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {tab === 'admins' ? t('pageTitleAdmins') : t('pageTitle')}
          </h1>
          <div className="flex items-center gap-2">
            {tab === 'members' && (
              <>
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
              </>
            )}
            {tab === 'admins' && isSuperAdmin && (
              <Button onClick={() => setCreateAdminOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createAdminButton')}
              </Button>
            )}
          </div>
        </div>

        <TabsList>
          <TabsTrigger value="members">{t('tabs.members')}</TabsTrigger>
          <TabsTrigger value="admins">{t('tabs.admins')}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTable
            members={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            isLoading={isLoading}
            isError={isError}
            currentUserId={auth?.user.id ?? ''}
            canPromote={isSuperAdmin}
            onRetry={() => refetch()}
            onPageChange={setPage}
            onView={setViewingMember}
            onEdit={setEditingMember}
            onDelete={(member) => deleteMember(member.id)}
            onPromote={(member) => promoteMember(member.id)}
          />
        </TabsContent>
        <TabsContent value="admins">
          <AdminsTable
            admins={adminsData?.items ?? []}
            total={adminsData?.total ?? 0}
            page={adminPage}
            pageSize={PAGE_SIZE}
            isLoading={isAdminsLoading}
            isError={isAdminsError}
            canManage={isSuperAdmin}
            onRetry={() => refetchAdmins()}
            onPageChange={setAdminPage}
            onView={setViewingAdmin}
            onEdit={setEditingAdmin}
            onDelete={(admin) => deleteAdmin(admin.id)}
            onDemote={(admin) => demoteAdmin(admin.id)}
          />
        </TabsContent>
      </Tabs>

      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        appliedFilters={appliedFilters}
        onApply={applyFilters}
        onClearAll={clearFilters}
      />
      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
      {viewingMember && (
        <MemberFormDialog
          mode="view"
          member={viewingMember}
          open={Boolean(viewingMember)}
          onOpenChange={(open) => !open && setViewingMember(null)}
        />
      )}
      {editingMember && (
        <MemberFormDialog
          mode="edit"
          member={editingMember}
          open={Boolean(editingMember)}
          onOpenChange={(open) => !open && setEditingMember(null)}
        />
      )}
      <CreateAdminDialog open={createAdminOpen} onOpenChange={setCreateAdminOpen} />
      {viewingAdmin && (
        <AdminFormDialog
          mode="view"
          admin={viewingAdmin}
          open={Boolean(viewingAdmin)}
          onOpenChange={(open) => !open && setViewingAdmin(null)}
        />
      )}
      {editingAdmin && (
        <AdminFormDialog
          mode="edit"
          admin={editingAdmin}
          open={Boolean(editingAdmin)}
          onOpenChange={(open) => !open && setEditingAdmin(null)}
        />
      )}
    </div>
  );
};
