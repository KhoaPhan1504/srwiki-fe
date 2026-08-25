import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '~root/i18n';
import { MenuTree } from './index';
import type { RouteType } from '~root/routes/routeTree';

const fixtureTree: RouteType[] = [
  {
    title: 'Nhóm Test',
    children: [
      { title: 'No Children Item', path: '/no-children' },
      {
        title: 'Has Children Item',
        children: [
          { title: 'Sub A', path: '/with-children/a' },
          { title: 'Sub B', path: '/with-children/b' },
        ],
      },
    ],
  },
];

const renderTree = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <MenuTree items={fixtureTree} />
    </MemoryRouter>,
  );

describe('MenuTree', () => {
  it('hides sub-items until the caret is clicked, then toggles them', async () => {
    const user = userEvent.setup();
    renderTree('/no-children');
    expect(screen.queryByText('Sub A')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Has Children Item' }));
    expect(screen.getByText('Sub A')).toBeInTheDocument();
    expect(screen.getByText('Sub B')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Has Children Item' }));
    expect(screen.queryByText('Sub A')).not.toBeInTheDocument();
  });

  it('auto-expands the branch containing the active route and marks only the active sub-item', () => {
    renderTree('/with-children/a');

    expect(screen.getByText('Sub A')).toBeInTheDocument();
    expect(screen.getByText('Sub B')).toBeInTheDocument();

    const activeLink = screen.getByRole('link', { name: 'Sub A' });
    const inactiveLink = screen.getByRole('link', { name: 'Sub B' });
    expect(activeLink.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    expect(inactiveLink.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
  });

  it('renders every item inside a single scrollable container (no pinned section)', () => {
    renderTree('/no-children');
    const scrollArea = document.querySelector('.overflow-y-auto');
    expect(scrollArea).not.toBeNull();
    expect(scrollArea).toContainElement(screen.getByRole('link', { name: 'No Children Item' }));
  });
});
