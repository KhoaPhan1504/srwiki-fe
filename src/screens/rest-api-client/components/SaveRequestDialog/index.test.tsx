import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('~root/apis', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~root/apis')>();
  return {
    ...actual,
    useCreateCollection: vi.fn(),
    useCreateSavedRequest: vi.fn(),
  };
});

import { useCreateCollection, useCreateSavedRequest } from '~root/apis';
import type { Collection, RestRequestConfig } from '~root/types';
import { SaveRequestDialog } from '.';

const requestState: RestRequestConfig = {
  method: 'GET',
  url: 'https://api.example.com/profile',
  queryParams: [],
  headers: [],
  body: '',
  bodyType: 'raw',
  bodyFields: [],
  auth: { type: 'none' },
};

const collection = (): Collection => ({
  id: 'c1',
  name: 'My Collection',
  createdAt: '2026-08-21T00:00:00Z',
  requests: [],
});

describe('SaveRequestDialog', () => {
  const createCollectionMutateAsync = vi.fn();
  const createSavedRequestMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateCollection).mockReturnValue({
      mutateAsync: createCollectionMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateCollection>);
    vi.mocked(useCreateSavedRequest).mockReturnValue({
      mutateAsync: createSavedRequestMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateSavedRequest>);
  });

  it('saves into an existing collection by default when collections exist', async () => {
    const user = userEvent.setup();
    createSavedRequestMutateAsync.mockResolvedValue({ id: 'r1' });
    const onSaved = vi.fn();
    render(
      <SaveRequestDialog
        open
        onOpenChange={vi.fn()}
        collections={[collection()]}
        requestState={requestState}
        onSaved={onSaved}
      />,
    );

    await user.type(screen.getByLabelText('Tên request'), 'Get profile');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(createCollectionMutateAsync).not.toHaveBeenCalled();
    expect(createSavedRequestMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ collectionId: 'c1', name: 'Get profile', ...requestState }),
    );
    expect(onSaved).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('creates a new collection first when "new collection" mode is selected', async () => {
    const user = userEvent.setup();
    createCollectionMutateAsync.mockResolvedValue({ id: 'c-new' });
    createSavedRequestMutateAsync.mockResolvedValue({ id: 'r1' });
    render(
      <SaveRequestDialog
        open
        onOpenChange={vi.fn()}
        collections={[collection()]}
        requestState={requestState}
        onSaved={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('radio', { name: 'Tạo collection mới' }));
    await user.type(screen.getByLabelText('Tên collection mới'), 'Fresh Collection');
    await user.type(screen.getByLabelText('Tên request'), 'Get profile');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(createCollectionMutateAsync).toHaveBeenCalledWith({ name: 'Fresh Collection' });
    expect(createSavedRequestMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ collectionId: 'c-new', name: 'Get profile' }),
    );
  });
});
