import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { OutputPanel } from '.';
import { ErrorCodes } from '~root/constants';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

describe('OutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the encode empty state when there is no input in encode mode', () => {
    render(<OutputPanel value="" mode="encode" error={null} />);
    expect(screen.getByText('Nhập văn bản để mã hoá sang Base64.')).toBeInTheDocument();
  });

  it('shows the decode empty state when there is no input in decode mode', () => {
    render(<OutputPanel value="" mode="decode" error={null} />);
    expect(screen.getByText('Dán chuỗi Base64 để giải mã.')).toBeInTheDocument();
  });

  it('renders the converted output', () => {
    render(<OutputPanel value="SGVsbG8=" mode="encode" error={null} />);
    expect(screen.getByText('SGVsbG8=')).toBeInTheDocument();
  });

  it('renders an error instead of the output when decoding is invalid', () => {
    render(
      <OutputPanel
        value=""
        mode="decode"
        error={{ code: ErrorCodes.INVALID_BASE64, message: 'bad' }}
      />,
    );
    expect(screen.getByText('Base64 không hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText('Chuỗi này không phải Base64 hợp lệ. Kiểm tra lại các ký tự hoặc dấu cách.'),
    ).toBeInTheDocument();
  });

  it('disables Copy when there is no output', () => {
    render(<OutputPanel value="" mode="encode" error={null} />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });

  it('copies the output to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<OutputPanel value="SGVsbG8=" mode="encode" error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('SGVsbG8=');
    await waitFor(() => expect(screen.getByText('Đã sao chép')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<OutputPanel value="SGVsbG8=" mode="encode" error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
