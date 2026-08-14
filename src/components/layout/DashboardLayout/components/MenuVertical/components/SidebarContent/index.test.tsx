import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { SidebarContent } from './index';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';

vi.mock('~root/apis', () => ({ useLogout: () => vi.fn() }));

const renderSidebar = (auth: AuthState) => {
  const store = createStore();
  store.set(authAtom, auth);
  return render(
    <JotaiProvider store={store}>
      <MemoryRouter>
        <SidebarContent logoSrc="/logo.svg" />
      </MemoryRouter>
    </JotaiProvider>,
  );
};

describe('SidebarContent', () => {
  it('shows the Member List item for an admin', () => {
    renderSidebar({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', role: 'admin', membershipTier: null },
    });
    expect(screen.getByText('Danh sách thành viên')).toBeInTheDocument();
  });

  it('hides the Member List item for a member', () => {
    renderSidebar({
      token: 'tok',
      user: { id: '1', email: 'a@b.com', role: 'member', membershipTier: 'regular' },
    });
    expect(screen.queryByText('Danh sách thành viên')).not.toBeInTheDocument();
  });
});
