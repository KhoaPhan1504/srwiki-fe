import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminsTable } from './index';
import type { Admin } from '~root/apis';
import { Role } from '~root/constants';

const ADMIN: Admin = {
  id: 'admin-1',
  email: 'admin1@b.com',
  fullName: 'Admin One',
  role: Role.ADMIN,
  address: '123 Le Loi, Ha Noi',
  dateOfBirth: '1990-01-01',
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
};

const baseProps = {
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isError: false,
  canManage: false,
  onRetry: vi.fn(),
  onPageChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onDemote: vi.fn(),
};

describe('AdminsTable', () => {
  it('shows the loading state', () => {
    render(<AdminsTable {...baseProps} admins={[]} isLoading />);
    expect(screen.queryByText('admin1@b.com')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no admins', () => {
    render(<AdminsTable {...baseProps} admins={[]} />);
    expect(screen.getByText('Không tìm thấy quản trị viên nào.')).toBeInTheDocument();
  });

  it('shows the error state', () => {
    render(<AdminsTable {...baseProps} admins={[]} isError />);
    expect(screen.getByText('Không thể tải danh sách quản trị viên.')).toBeInTheDocument();
  });

  it('renders an admin row with its fields', () => {
    render(<AdminsTable {...baseProps} admins={[ADMIN]} total={1} />);
    expect(screen.getByText('Admin One')).toBeInTheDocument();
    expect(screen.getByText('admin1@b.com')).toBeInTheDocument();
    expect(screen.getByText('123 Le Loi, Ha Noi')).toBeInTheDocument();
  });

  it('hides edit/delete/demote actions when canManage is false', () => {
    render(<AdminsTable {...baseProps} admins={[ADMIN]} total={1} canManage={false} />);
    expect(screen.getByRole('button', { name: 'Thông tin quản trị viên' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sửa thông tin quản trị viên' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hạ xuống Thành viên' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xoá' })).not.toBeInTheDocument();
  });

  it('demotes an admin after confirming when canManage is true', async () => {
    const user = userEvent.setup();
    const onDemote = vi.fn();
    render(<AdminsTable {...baseProps} admins={[ADMIN]} total={1} canManage onDemote={onDemote} />);
    await user.click(screen.getByRole('button', { name: 'Hạ xuống Thành viên' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Hạ xuống Thành viên' });
    await user.click(confirmButtons[confirmButtons.length - 1]);
    expect(onDemote).toHaveBeenCalledWith(ADMIN);
  });
});
