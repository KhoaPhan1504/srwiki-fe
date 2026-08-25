import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '~root/i18n';
import { MenuItem } from './index';
import type { RouteType } from '~root/routes/routeTree';

const leafItem: RouteType = { title: 'Leaf Item', path: '/leaf' };

const groupItem: RouteType = {
  title: 'Parent Item',
  children: [
    { title: 'Child A', path: '/parent/a' },
    { title: 'Child B', path: '/parent/b' },
  ],
};

const renderItem = (item: RouteType, isExpanded: boolean, onToggle = vi.fn()) =>
  render(
    <MemoryRouter initialEntries={['/somewhere-else']}>
      <MenuItem item={item} isExpanded={isExpanded} onToggle={onToggle} />
    </MemoryRouter>,
  );

describe('MenuItem', () => {
  it('renders a plain link with no caret when the item has no children', () => {
    renderItem(leafItem, false);
    expect(screen.getByRole('link', { name: 'Leaf Item' })).toHaveAttribute('href', '/leaf');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a caret but hides children when collapsed', () => {
    renderItem(groupItem, false);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.queryByText('Child A')).not.toBeInTheDocument();
  });

  it('shows children when expanded', () => {
    renderItem(groupItem, true);
    expect(screen.getByText('Child A')).toBeInTheDocument();
    expect(screen.getByText('Child B')).toBeInTheDocument();
  });

  it('calls onToggle with the node key when the caret is clicked, without navigating', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderItem(groupItem, false, onToggle);
    await user.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith('Parent Item');
  });

  it('renders a non-link label for a group with no path of its own', () => {
    renderItem(groupItem, false);
    expect(screen.queryByRole('link', { name: 'Parent Item' })).not.toBeInTheDocument();
    expect(screen.getByText('Parent Item')).toBeInTheDocument();
  });
});
