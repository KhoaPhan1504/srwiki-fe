import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { OutputPanel } from '.';
import { ErrorCodes, OperationMode } from '~root/constants';

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
    render(<OutputPanel value="" mode={OperationMode.ENCODE} error={null} />);
    expect(screen.getByText('Nhập văn bản để mã hoá URL.')).toBeInTheDocument();
  });

  it('shows the decode empty state when there is no input in decode mode', () => {
    render(<OutputPanel value="" mode={OperationMode.DECODE} error={null} />);
    expect(screen.getByText('Dán chuỗi đã mã hoá URL để giải mã.')).toBeInTheDocument();
  });

  it('renders the converted output', () => {
    render(<OutputPanel value="hello%20world" mode={OperationMode.ENCODE} error={null} />);
    expect(screen.getByText('hello%20world')).toBeInTheDocument();
  });

  it('renders an error instead of the output when decoding is invalid', () => {
    render(
      <OutputPanel
        value=""
        mode={OperationMode.DECODE}
        error={{ code: ErrorCodes.INVALID_URI_ENCODING, message: 'bad' }}
      />,
    );
    expect(screen.getByText('Mã hoá không hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText('Chuỗi này không phải mã hoá URL hợp lệ. Kiểm tra các ký tự % và thử lại.'),
    ).toBeInTheDocument();
  });

  it('disables Copy when there is no output', () => {
    render(<OutputPanel value="" mode={OperationMode.ENCODE} error={null} />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });

  it('copies the output to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<OutputPanel value="hello%20world" mode={OperationMode.ENCODE} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('hello%20world');
    await waitFor(() => expect(screen.getByText('Đã sao chép')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<OutputPanel value="hello%20world" mode={OperationMode.ENCODE} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
