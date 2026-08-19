import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '~root/components/ui';
import { authAtom } from '~root/stores';
import { Role } from '~root/constants';
import type { TimezoneMode } from '~root/constants';
import { asDateRange, dateOnly, toCreatedAtFromIso, toCreatedAtToIso } from '~root/utils';
import {
  useDeleteAdmin,
  useDeleteMember,
  useDemoteAdmin,
  useGetAdmins,
  useGetMembers,
  useGetSettings,
  usePromoteMember,
} from '~root/apis';
import { useAdminMembersFilters, useAdminAdminsFilters } from './hooks';
import { MembersTable } from './components/MembersTable';
import { AdminsTable } from './components/AdminsTable';
import { TimezoneSwitch } from './components/TimezoneSwitch';
import { CreateMemberDialog } from './components/CreateMemberDialog';
import { MemberFormDialog } from './components/MemberFormDialog';
import { CreateAdminDialog } from './components/CreateAdminDialog';
import { AdminFormDialog } from './components/AdminFormDialog';
import type { Admin, Member } from '~root/apis';

const PAGE_SIZE = 20;
const VALID_TABS = ['members', 'admins'] as const;
type AdminMembersTab = (typeof VALID_TABS)[number];

const isValidTab = (value: string | null): value is AdminMembersTab =>
  !!value && (VALID_TABS as readonly string[]).includes(value);

export const AdminMembersScreen = () => {
  const { t } = useTranslation('admin-members');
  const auth = useAtomValue(authAtom);
  const isSuperAdmin = auth?.user.role === Role.SUPER_ADMIN;
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: AdminMembersTab = isValidTab(searchParams.get('tab'))
    ? (searchParams.get('tab') as AdminMembersTab)
    : 'members';

  const { filters, sort, page, setFilters, setSort, setPage } = useAdminMembersFilters();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { settings } = useGetSettings();
  const { mutate: deleteMember } = useDeleteMember();
  const { mutate: promoteMember } = usePromoteMember();
  const timezoneMode: TimezoneMode = settings?.timezone === 'UTC' ? 'UTC' : 'local';
  const createdAtRange = asDateRange(filters.createdAt);
  const birthdayRange = asDateRange(filters.birthday);
  const membershipTierFilter = filters.membershipTier;
  const { data, isLoading, isError, refetch } = useGetMembers({
    page,
    pageSize: PAGE_SIZE,
    sortBy: sort?.column,
    sortDirection: sort?.direction,
    membershipTier:
      Array.isArray(membershipTierFilter) && membershipTierFilter.length > 0
        ? membershipTierFilter.join(',')
        : undefined,
    createdAtFrom: createdAtRange.from
      ? toCreatedAtFromIso(dateOnly(createdAtRange.from) ?? '', timezoneMode)
      : undefined,
    createdAtTo: createdAtRange.to
      ? toCreatedAtToIso(dateOnly(createdAtRange.to) ?? '', timezoneMode)
      : undefined,
    address: typeof filters.address === 'string' && filters.address ? filters.address : undefined,
    birthdayFrom: dateOnly(birthdayRange.from),
    birthdayTo: dateOnly(birthdayRange.to),
  });

  const {
    filters: adminsFilters,
    sort: adminsSort,
    page: adminPage,
    setFilters: setAdminsFilters,
    setSort: setAdminsSort,
    setPage: setAdminPage,
  } = useAdminAdminsFilters();
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const { mutate: deleteAdmin } = useDeleteAdmin();
  const { mutate: demoteAdmin } = useDemoteAdmin();
  const adminsAddressFilter = adminsFilters.address;
  const adminsCreatedAtRange = asDateRange(adminsFilters.createdAt);
  const {
    data: adminsData,
    isLoading: isAdminsLoading,
    isError: isAdminsError,
    refetch: refetchAdmins,
  } = useGetAdmins({
    page: adminPage,
    pageSize: PAGE_SIZE,
    sortBy: adminsSort?.column,
    sortDirection: adminsSort?.direction,
    address:
      typeof adminsAddressFilter === 'string' && adminsAddressFilter
        ? adminsAddressFilter
        : undefined,
    createdAtFrom: adminsCreatedAtRange.from
      ? toCreatedAtFromIso(dateOnly(adminsCreatedAtRange.from) ?? '', timezoneMode)
      : undefined,
    createdAtTo: adminsCreatedAtRange.to
      ? toCreatedAtToIso(dateOnly(adminsCreatedAtRange.to) ?? '', timezoneMode)
      : undefined,
  });

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
            sort={sort}
            filters={filters}
            onRetry={() => refetch()}
            onPageChange={setPage}
            onSortChange={setSort}
            onFiltersChange={setFilters}
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
            sort={adminsSort}
            filters={adminsFilters}
            onRetry={() => refetchAdmins()}
            onPageChange={setAdminPage}
            onSortChange={setAdminsSort}
            onFiltersChange={setAdminsFilters}
            onView={setViewingAdmin}
            onEdit={setEditingAdmin}
            onDelete={(admin) => deleteAdmin(admin.id)}
            onDemote={(admin) => demoteAdmin(admin.id)}
          />
        </TabsContent>
      </Tabs>

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
