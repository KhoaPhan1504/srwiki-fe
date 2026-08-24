import '~root/i18n';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('~root/apis/useInspectHeaders', () => ({
  useInspectHeaders: vi.fn(),
}));

import { useInspectHeaders } from '~root/apis/useInspectHeaders';
import type { HeaderInspectionResponse } from '~root/types';
import { HeadersInspectorScreen } from '.';

const sampleResponse = (): HeaderInspectionResponse => ({
  statusCode: 200,
  reasonPhrase: 'OK',
  headers: [{ name: 'content-type', value: 'application/json' }],
  finalUrl: 'https://api.example.com/',
  redirectCount: 0,
  durationMs: 42,
  httpVersion: '1.1',
});

const backendAxiosError = (code: string, message: string) =>
  new AxiosError(message, 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data: { detail: { code, message } },
  } as never);

const mockMutateAsync = (impl: ReturnType<typeof vi.fn>) => {
  vi.mocked(useInspectHeaders).mockReturnValue({
    mutateAsync: impl,
  } as unknown as ReturnType<typeof useInspectHeaders>);
};

describe('HeadersInspectorScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the tool title', () => {
    mockMutateAsync(vi.fn());
    render(<HeadersInspectorScreen />);
    expect(screen.getByRole('heading', { name: 'HTTP Headers Inspector' })).toBeInTheDocument();
  });

  it('shows the idle placeholder before any request is sent', () => {
    mockMutateAsync(vi.fn());
    render(<HeadersInspectorScreen />);
    expect(screen.getByText('Nhập một URL và nhấn Kiểm tra để xem phản hồi.')).toBeInTheDocument();
  });

  it('sends the request and shows the success state', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    mockMutateAsync(mutateAsync);

    const user = userEvent.setup();
    render(<HeadersInspectorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(mutateAsync).toHaveBeenCalledWith('https://api.example.com');
    expect(await screen.findByText('200 OK')).toBeInTheDocument();
    expect(screen.getByText('content-type:')).toBeInTheDocument();
  });

  it('shows the fixed, code-driven message for a blocked URL, never the raw backend text', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(backendAxiosError('BLOCKED_URL', 'blocked: internal metadata IP'));
    mockMutateAsync(mutateAsync);

    const user = userEvent.setup();
    render(<HeadersInspectorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://blocked.example.com');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể kiểm tra URL này.');
    expect(screen.queryByText(/internal metadata IP/)).not.toBeInTheDocument();
  });

  it('does not treat a subsequent edit of the URL input as a redirect once a response is already displayed', async () => {
    // Regression: ResponseSummary used to be passed the live `url` state
    // (the input box's current value) instead of the URL that actually
    // produced the displayed response. Editing the input after a response
    // renders — without re-sending — used to flip on a bogus "URL cuối
    // cùng" (final URL) line implying a redirect that never happened.
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    mockMutateAsync(mutateAsync);

    const user = userEvent.setup();
    render(<HeadersInspectorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(await screen.findByText('200 OK')).toBeInTheDocument();
    expect(screen.queryByText(/URL cuối cùng/)).not.toBeInTheDocument();

    // Edit the URL box without clicking Inspect again — the response panel
    // still shows the response for the original URL.
    await user.type(screen.getByLabelText('URL yêu cầu'), 'edited');

    expect(screen.queryByText(/URL cuối cùng/)).not.toBeInTheDocument();
  });

  it('announces the sending and success states via a polite live region', async () => {
    let resolveMutation!: (value: HeaderInspectionResponse) => void;
    const mutateAsync = vi.fn().mockImplementation(
      () =>
        new Promise<HeaderInspectionResponse>((resolve) => {
          resolveMutation = resolve;
        }),
    );
    mockMutateAsync(mutateAsync);

    const user = userEvent.setup();
    render(<HeadersInspectorScreen />);

    // Idle state is already inside the live region.
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));

    const sendingRegion = screen.getByRole('status');
    expect(sendingRegion).toHaveAttribute('aria-live', 'polite');
    expect(sendingRegion).toHaveTextContent('Đang gửi yêu cầu…');

    resolveMutation(sampleResponse());
    expect(await screen.findByText('200 OK')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('resets back to idle after Clear is confirmed', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(sampleResponse());
    mockMutateAsync(mutateAsync);

    const user = userEvent.setup();
    render(<HeadersInspectorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com');
    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(await screen.findByText('200 OK')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Xoá' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('URL yêu cầu')).toHaveValue('');
    expect(screen.getByText('Nhập một URL và nhấn Kiểm tra để xem phản hồi.')).toBeInTheDocument();
  });
});
