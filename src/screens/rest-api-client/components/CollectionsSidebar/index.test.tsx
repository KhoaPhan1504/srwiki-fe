import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Collection } from '~root/types';
import { CollectionsSidebar } from '.';

const collection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'c1',
  name: 'My Collection',
  createdAt: '2026-08-21T00:00:00Z',
  requests: [
    {
      id: 'r1',
      collectionId: 'c1',
      name: 'Get profile',
      method: 'GET',
      url: 'https://api.example.com/profile',
      queryParams: [],
      headers: [],
      body: '',
      bodyType: 'raw',
      bodyFields: [],
      auth: { type: 'none' },
      createdAt: '2026-08-21T00:00:00Z',
      updatedAt: '2026-08-21T00:00:00Z',
    },
  ],
  ...overrides,
});

const baseProps = {
  collections: [] as Collection[],
  isLoading: false,
  loadedRequestId: null,
  onSelectRequest: vi.fn(),
  onCreateCollection: vi.fn(),
  onRenameCollection: vi.fn(),
  onDeleteCollection: vi.fn(),
  onRenameRequest: vi.fn(),
  onDeleteRequest: vi.fn(),
};

describe('CollectionsSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty state when there are no collections', () => {
    render(<CollectionsSidebar {...baseProps} />);
    expect(screen.getByText('Chưa có collection nào.')).toBeInTheDocument();
  });

  it('expands a collection to reveal its requests and calls onSelectRequest on click', async () => {
    const user = userEvent.setup();
    const onSelectRequest = vi.fn();
    render(
      <CollectionsSidebar
        {...baseProps}
        collections={[collection()]}
        onSelectRequest={onSelectRequest}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'My Collection' }));
    await user.click(screen.getByRole('button', { name: /Get profile/ }));

    expect(onSelectRequest).toHaveBeenCalledWith(collection().requests[0]);
  });

  it('opens the rename dialog for a collection and calls onRenameCollection on submit', async () => {
    const user = userEvent.setup();
    const onRenameCollection = vi.fn();
    render(
      <CollectionsSidebar
        {...baseProps}
        collections={[collection()]}
        onRenameCollection={onRenameCollection}
      />,
    );

    const collectionRow = screen.getByText('My Collection').closest('div')!;
    await user.click(within(collectionRow).getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Đổi tên' }));
    await user.clear(screen.getByLabelText('Tên'));
    await user.type(screen.getByLabelText('Tên'), 'Renamed');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onRenameCollection).toHaveBeenCalledWith('c1', 'Renamed');
  });

  it('confirms before calling onDeleteRequest', async () => {
    const user = userEvent.setup();
    const onDeleteRequest = vi.fn();
    render(
      <CollectionsSidebar
        {...baseProps}
        collections={[collection()]}
        onDeleteRequest={onDeleteRequest}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'My Collection' }));
    const requestRow = screen.getByText('Get profile').closest('div')!;
    await user.click(within(requestRow).getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Xoá' }));
    expect(onDeleteRequest).not.toHaveBeenCalled();

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));

    expect(onDeleteRequest).toHaveBeenCalledWith('r1');
  });
});
