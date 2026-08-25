import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '~root/i18n';
import { MenuGroup } from './index';
import type { RouteType } from '~root/routes/routeTree';

const leafGroup: RouteType = { title: 'Dashboard', path: '/dashboard' };

const headerGroup: RouteType = {
  title: 'Nhóm Test',
  children: [
    { title: 'Item A', path: '/a' },
    { title: 'Item B', path: '/b' },
  ],
};

const renderGroup = (group: RouteType) =>
  render(
    <MemoryRouter initialEntries={['/somewhere-else']}>
      <MenuGroup group={group} expandedPaths={new Set()} onToggle={vi.fn()} />
    </MemoryRouter>,
  );

describe('MenuGroup', () => {
  it('renders a leaf node as a plain item with no header', () => {
    renderGroup(leafGroup);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('Nhóm Test')).not.toBeInTheDocument();
  });

  it('renders a header and each child as a MenuItem', () => {
    renderGroup(headerGroup);
    expect(screen.getByText('Nhóm Test')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Item A' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Item B' })).toBeInTheDocument();
  });
});
