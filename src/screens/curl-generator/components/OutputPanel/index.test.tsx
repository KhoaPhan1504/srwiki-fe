import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '~root/constants';
import { OutputPanel } from '.';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

const baseProps = {
  result: null,
  format: 'singleLine' as const,
  onFormatChange: vi.fn(),
};

describe('OutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty state when there is no result', () => {
    render(<OutputPanel {...baseProps} />);
    expect(screen.getByText('Nhập URL yêu cầu để sinh lệnh curl.')).toBeInTheDocument();
  });

  it('renders the generated command in a code block for a successful result', () => {
    render(
      <OutputPanel
        {...baseProps}
        result={{ success: true, command: "curl -X GET 'https://api.example.com/users'" }}
      />,
    );
    expect(screen.getByText("curl -X GET 'https://api.example.com/users'")).toBeInTheDocument();
  });

  it('shows an invalid-URL error', () => {
    render(
      <OutputPanel
        {...baseProps}
        result={{ success: false, error: { code: ErrorCodes.INVALID_URL, message: 'bad' } }}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Không thể sinh lệnh')).toBeInTheDocument();
    expect(
      screen.getByText('Nhập một URL hợp lệ, ví dụ https://api.example.com.'),
    ).toBeInTheDocument();
  });

  it('shows an invalid-header-key error', () => {
    render(
      <OutputPanel
        {...baseProps}
        result={{
          success: false,
          error: { code: ErrorCodes.INVALID_HEADER_KEY, message: 'bad' },
        }}
      />,
    );
    expect(screen.getByText('Tên header này không hợp lệ.')).toBeInTheDocument();
  });

  it('never renders the raw error.message from the result', () => {
    render(
      <OutputPanel
        {...baseProps}
        result={{
          success: false,
          error: { code: ErrorCodes.INVALID_URL, message: 'raw internal message' },
        }}
      />,
    );
    expect(screen.queryByText('raw internal message')).not.toBeInTheDocument();
  });

  it('calls onFormatChange when the multi-line tab is selected', async () => {
    const user = userEvent.setup();
    const onFormatChange = vi.fn();
    render(<OutputPanel {...baseProps} onFormatChange={onFormatChange} />);

    await user.click(screen.getByRole('tab', { name: 'Nhiều dòng' }));
    expect(onFormatChange).toHaveBeenCalledWith('multiLine');
  });

  it('disables the copy button when there is no command to copy', () => {
    render(<OutputPanel {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Sao chép' })).toBeDisabled();
  });

  it('copies the generated command to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(
      <OutputPanel
        {...baseProps}
        result={{ success: true, command: "curl -X GET 'https://api.example.com/users'" }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sao chép' }));

    expect(writeText).toHaveBeenCalledWith("curl -X GET 'https://api.example.com/users'");
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Đã sao chép' })).toBeInTheDocument(),
    );
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(
      <OutputPanel
        {...baseProps}
        result={{ success: true, command: "curl -X GET 'https://api.example.com/users'" }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sao chép' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
