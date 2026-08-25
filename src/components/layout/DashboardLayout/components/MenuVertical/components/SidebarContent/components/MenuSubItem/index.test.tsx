import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '~root/i18n';
import { MenuSubItem } from './index';
import type { RouteType } from '~root/routes/routeTree';

const item: RouteType = { title: 'Sub Item', path: '/parent/sub' };

const renderSubItem = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MenuSubItem item={item} />
    </MemoryRouter>,
  );

describe('MenuSubItem', () => {
  it('renders the label as a link to its path', () => {
    renderSubItem('/somewhere-else');
    const link = screen.getByRole('link', { name: 'Sub Item' });
    expect(link).toHaveAttribute('href', '/parent/sub');
  });

  it('shows no dot when the route is not active', () => {
    renderSubItem('/somewhere-else');
    const link = screen.getByRole('link', { name: 'Sub Item' });
    expect(link.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('shows a dot when the route is active', () => {
    renderSubItem('/parent/sub');
    const link = screen.getByRole('link', { name: 'Sub Item' });
    expect(link.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });
});
