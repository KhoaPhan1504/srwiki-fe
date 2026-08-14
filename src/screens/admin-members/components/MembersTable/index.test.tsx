import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MembersTable } from './index';
import type { Member } from '~root/apis';

const MEMBER: Member = {
  id: 'member-1',
  email: 'member1@b.com',
  fullName: 'Member One',
  role: 'member',
  membershipTier: 'vip',
  address: '123 Le Loi, Ha Noi',
  dateOfBirth: '1995-06-01',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const baseProps = {
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isError: false,
  currentUserId: 'admin-1',
  canPromote: false,
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
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

  it('shows the empty state when there are no members', () => {
    render(<MembersTable {...baseProps} members={[]} />);
    expect(screen.getByText('Không tìm thấy thành viên nào.')).toBeInTheDocument();
  });

  it('shows the error state and calls onRetry', () => {
    render(<MembersTable {...baseProps} members={[]} isError />);
    expect(screen.getByText('Không thể tải danh sách thành viên.')).toBeInTheDocument();
  });

  it('renders a member row with its fields', () => {
    render(<MembersTable {...baseProps} members={[MEMBER]} total={1} />);
    expect(screen.getByText('Member One')).toBeInTheDocument();
    expect(screen.getByText('member1@b.com')).toBeInTheDocument();
    expect(screen.getByText('123 Le Loi, Ha Noi')).toBeInTheDocument();
  });

  it("disables the delete action for the current user's own row", () => {
    render(
      <MembersTable
        {...baseProps}
        members={[{ ...MEMBER, id: 'admin-1' }]}
        total={1}
        currentUserId="admin-1"
      />,
    );
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
  });

  it('hides the promote action when canPromote is false', () => {
    render(<MembersTable {...baseProps} members={[MEMBER]} total={1} canPromote={false} />);
    expect(
      screen.queryByRole('button', { name: 'Nâng lên Quản trị viên' }),
    ).not.toBeInTheDocument();
  });

  it('promotes a member after confirming when canPromote is true', async () => {
    const user = userEvent.setup();
    const onPromote = vi.fn();
    render(
      <MembersTable {...baseProps} members={[MEMBER]} total={1} canPromote onPromote={onPromote} />,
    );
    await user.click(screen.getByRole('button', { name: 'Nâng lên Quản trị viên' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Nâng lên Quản trị viên' });
    await user.click(confirmButtons[confirmButtons.length - 1]);
    expect(onPromote).toHaveBeenCalledWith(MEMBER);
  });
});
