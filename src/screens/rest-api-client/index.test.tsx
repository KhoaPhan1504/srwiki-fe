import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('~root/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~root/utils')>();
  return { ...actual, executeRestRequest: vi.fn() };
});

vi.mock('~root/apis', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~root/apis')>();
  return {
    ...actual,
    useGetCollections: vi.fn(),
    useCreateCollection: vi.fn(),
    useRenameCollection: vi.fn(),
    useDeleteCollection: vi.fn(),
    useCreateSavedRequest: vi.fn(),
    useUpdateSavedRequest: vi.fn(),
    useDeleteSavedRequest: vi.fn(),
    useGetEnvironments: vi.fn(),
    useGetGlobalVariables: vi.fn(),
    useCreateEnvironment: vi.fn(),
    useUpdateEnvironment: vi.fn(),
    useDeleteEnvironment: vi.fn(),
    useUpdateGlobalVariables: vi.fn(),
  };
});

import {
  useCreateCollection,
  useCreateEnvironment,
  useCreateSavedRequest,
  useDeleteCollection,
  useDeleteEnvironment,
  useDeleteSavedRequest,
  useGetCollections,
  useGetEnvironments,
  useGetGlobalVariables,
  useRenameCollection,
  useUpdateEnvironment,
  useUpdateGlobalVariables,
  useUpdateSavedRequest,
} from '~root/apis';
import { ErrorCodes } from '~root/constants';
import { executeRestRequest } from '~root/utils';
import { RestApiClientScreen } from '.';

describe('RestApiClientScreen', () => {
  const mutateFn = () => vi.fn();

  beforeEach(() => {
    vi.mocked(useGetCollections).mockReturnValue({ collections: [], isLoading: false });
    vi.mocked(useCreateCollection).mockReturnValue({
      mutateAsync: vi.fn(),
      mutate: mutateFn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateCollection>);
    vi.mocked(useRenameCollection).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useRenameCollection>);
    vi.mocked(useDeleteCollection).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useDeleteCollection>);
    vi.mocked(useCreateSavedRequest).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useCreateSavedRequest>);
    vi.mocked(useUpdateSavedRequest).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useUpdateSavedRequest>);
    vi.mocked(useDeleteSavedRequest).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useDeleteSavedRequest>);
    vi.mocked(useGetEnvironments).mockReturnValue({ environments: [], isLoading: false });
    vi.mocked(useGetGlobalVariables).mockReturnValue({ variables: [], isLoading: false });
    vi.mocked(useCreateEnvironment).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useCreateEnvironment>);
    vi.mocked(useUpdateEnvironment).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useUpdateEnvironment>);
    vi.mocked(useDeleteEnvironment).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useDeleteEnvironment>);
    vi.mocked(useUpdateGlobalVariables).mockReturnValue({
      mutate: mutateFn(),
    } as unknown as ReturnType<typeof useUpdateGlobalVariables>);
  });

  it('renders the tool title', () => {
    render(<RestApiClientScreen />);
    expect(screen.getByRole('heading', { name: 'REST API Client' })).toBeInTheDocument();
  });

  it('starts idle with Send disabled and a placeholder response panel', () => {
    render(<RestApiClientScreen />);
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeDisabled();
    expect(screen.getByText('Gửi một yêu cầu để xem phản hồi ở đây.')).toBeInTheDocument();
  });

  it('sends a request and displays the response', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({
      success: true,
      response: {
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: { 'content-type': 'application/json' },
        durationMs: 50,
        sizeBytes: 13,
        body: { isJson: true, json: { ok: true }, text: '{"ok":true}' },
      },
    });
    const user = userEvent.setup();
    render(<RestApiClientScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    expect(await screen.findByText('200 OK')).toBeInTheDocument();
    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: 'https://api.example.com' }),
      expect.any(AbortSignal),
    );
  });

  it('shows a mapped error message when the request fails', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({
      success: false,
      error: { code: ErrorCodes.NETWORK_ERROR, message: 'Failed to fetch' },
    });
    const user = userEvent.setup();
    render(<RestApiClientScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    expect(
      await screen.findByText('Gửi yêu cầu thất bại — kiểm tra lại URL và kết nối mạng.'),
    ).toBeInTheDocument();
  });

  it('disables the Body tab for GET and enables it for POST', async () => {
    const user = userEvent.setup();
    render(<RestApiClientScreen />);

    expect(screen.getByRole('tab', { name: 'Nội dung' })).toBeDisabled();

    await user.click(screen.getByRole('combobox', { name: 'Phương thức HTTP' }));
    await user.click(screen.getByRole('option', { name: 'POST' }));

    expect(screen.getByRole('tab', { name: 'Nội dung' })).toBeEnabled();
  });

  it('clears the URL and response after confirming Clear', async () => {
    vi.mocked(executeRestRequest).mockResolvedValue({
      success: true,
      response: {
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: {},
        durationMs: 1,
        sizeBytes: 0,
        body: { isJson: false, text: '' },
      },
    });
    const user = userEvent.setup();
    render(<RestApiClientScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    await screen.findByText('200 OK');

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Xoá' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('URL yêu cầu')).toHaveValue('');
    expect(screen.getByText('Gửi một yêu cầu để xem phản hồi ở đây.')).toBeInTheDocument();
  });

  it('renders the collections sidebar', () => {
    vi.mocked(useGetCollections).mockReturnValue({
      collections: [
        {
          id: 'c1',
          name: 'My Collection',
          createdAt: '2026-08-21T00:00:00Z',
          requests: [],
        },
      ],
      isLoading: false,
    });
    render(<RestApiClientScreen />);
    expect(screen.getByText('My Collection')).toBeInTheDocument();
  });

  it('loads a saved request into the builder when clicked in the sidebar', async () => {
    const user = userEvent.setup();
    vi.mocked(useGetCollections).mockReturnValue({
      collections: [
        {
          id: 'c1',
          name: 'My Collection',
          createdAt: '2026-08-21T00:00:00Z',
          requests: [
            {
              id: 'r1',
              collectionId: 'c1',
              name: 'Get profile',
              method: 'POST',
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
        },
      ],
      isLoading: false,
    });
    render(<RestApiClientScreen />);

    await user.click(screen.getByRole('button', { name: 'My Collection' }));
    await user.click(screen.getByRole('button', { name: /Get profile/ }));

    expect(screen.getByLabelText('URL yêu cầu')).toHaveValue('https://api.example.com/profile');
  });

  it('overwrites the loaded saved request when Save is clicked', async () => {
    const user = userEvent.setup();
    const updateSavedRequest = vi.fn();
    vi.mocked(useUpdateSavedRequest).mockReturnValue({
      mutate: updateSavedRequest,
    } as unknown as ReturnType<typeof useUpdateSavedRequest>);
    vi.mocked(useGetCollections).mockReturnValue({
      collections: [
        {
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
        },
      ],
      isLoading: false,
    });
    render(<RestApiClientScreen />);

    await user.click(screen.getByRole('button', { name: 'My Collection' }));
    await user.click(screen.getByRole('button', { name: /Get profile/ }));
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(updateSavedRequest).toHaveBeenCalledWith(expect.objectContaining({ id: 'r1' }));
  });

  it('opens the save dialog when Save is clicked with nothing loaded', async () => {
    const user = userEvent.setup();
    render(<RestApiClientScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(screen.getByText('Lưu request')).toBeInTheDocument();
  });

  it('substitutes an environment variable into the URL when sending', async () => {
    const user = userEvent.setup();
    vi.mocked(executeRestRequest).mockResolvedValue({
      success: true,
      response: {
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: {},
        durationMs: 1,
        sizeBytes: 0,
        body: { isJson: false, text: '' },
      },
    });
    vi.mocked(useGetEnvironments).mockReturnValue({
      environments: [
        {
          id: 'e1',
          name: 'Dev',
          variables: [{ id: 'v1', key: 'base_url', value: 'https://dev.api', enabled: true }],
          createdAt: '2026-08-21T00:00:00Z',
          updatedAt: '2026-08-21T00:00:00Z',
        },
      ],
      isLoading: false,
    });
    render(<RestApiClientScreen />);

    await user.click(screen.getByRole('combobox', { name: 'Environment' }));
    await user.click(screen.getByRole('option', { name: 'Dev' }));
    // userEvent.type() treats `{` as a special-key escape char — `{{` types one literal `{`.
    await user.type(screen.getByLabelText('URL yêu cầu'), '{{{{base_url}}/users');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));

    expect(executeRestRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://dev.api/users' }),
      expect.any(AbortSignal),
    );
  });
});
