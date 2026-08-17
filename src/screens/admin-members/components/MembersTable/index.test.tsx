import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersTable } from './index';
import type { Member } from '~root/apis';
import { MembershipTier, Role } from '~root/constants';

const MEMBER: Member = {
  id: 'member-1',
  email: 'member1@b.com',
  fullName: 'Member One',
  role: Role.MEMBER,
  membershipTier: MembershipTier.VIP,
  address: '123 Le Loi, Ha Noi',
  dateOfBirth: '1995-06-01',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const baseProps = {
  total: 1,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isError: false,
  currentUserId: 'admin-1',
  canPromote: false,
  sort: null,
  filters: {},
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
  onSortChange: vi.fn(),
  onFiltersChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPromote: vi.fn(),
};

describe('MembersTable', () => {
  it('shows the loading state', () => {
    render(<MembersTable {...baseProps} members={[]} isLoading />);
    expect(screen.queryByText('member1@b.com')).not.toBeInTheDocument();
  });

  it('shows an error card and retries', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<MembersTable {...baseProps} members={[]} isError onRetry={onRetry} />);
    await user.click(screen.getByText('Thử lại'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders a member row with role and membership tier badges', () => {
    render(<MembersTable {...baseProps} members={[MEMBER]} />);
    expect(screen.getByText('Member One')).toBeInTheDocument();
    expect(screen.getByText('member1@b.com')).toBeInTheDocument();
    expect(screen.getByText('Thành viên')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('calls onSortChange when clicking a sortable column header', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<MembersTable {...baseProps} members={[MEMBER]} onSortChange={onSortChange} />);
    await user.click(screen.getByText('Họ tên'));
    expect(onSortChange).toHaveBeenCalledWith({ column: 'fullName', direction: 'asc' });
  });

  it('calls onView when clicking the view action, and onDelete after confirming', async () => {
    const user = userEvent.setup();
    const onView = vi.fn();
    const onDelete = vi.fn();
    render(<MembersTable {...baseProps} members={[MEMBER]} onView={onView} onDelete={onDelete} />);

    await user.click(screen.getByLabelText('Thông tin thành viên'));
    expect(onView).toHaveBeenCalledWith(MEMBER);

    await user.click(screen.getByLabelText('Xoá'));
    await user.click(screen.getByText('Xoá'));
    expect(onDelete).toHaveBeenCalledWith(MEMBER);
  });

  it('paginates via onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <MembersTable
        {...baseProps}
        members={[MEMBER]}
        total={40}
        page={1}
        onPageChange={onPageChange}
      />,
    );
    await user.click(screen.getByText('Sau'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
