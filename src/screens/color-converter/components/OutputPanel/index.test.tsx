import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '~root/constants';
import { OutputPanel } from '.';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

const getRow = (labelText: string): HTMLElement => {
  const row = screen.getByText(labelText).closest('li');
  if (!row) throw new Error(`Row for label "${labelText}" not found`);
  return row;
};

const successResult = {
  success: true as const,
  color: {
    format: 'hex' as const,
    rgb: { r: 255, g: 0, b: 0 },
    hex: '#ff0000',
    rgbString: 'rgb(255, 0, 0)',
    hslString: 'hsl(0, 100%, 50%)',
  },
};

describe('OutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty state when there is no result', () => {
    render(<OutputPanel result={null} />);
    expect(screen.getByText('Nhập mã màu để chuyển đổi.')).toBeInTheDocument();
  });

  it('renders HEX/RGB/HSL rows and a color preview swatch for a successful result', () => {
    render(<OutputPanel result={successResult} />);

    expect(within(getRow('HEX')).getByText('#ff0000')).toBeInTheDocument();
    expect(within(getRow('RGB')).getByText('rgb(255, 0, 0)')).toBeInTheDocument();
    expect(within(getRow('HSL')).getByText('hsl(0, 100%, 50%)')).toBeInTheDocument();

    const swatch = screen.getByRole('img', { name: 'Xem trước màu cho #ff0000' });
    expect(swatch).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('shows an invalid-hex error', () => {
    render(
      <OutputPanel
        result={{ success: false, error: { code: ErrorCodes.INVALID_HEX, message: 'bad' } }}
      />,
    );
    expect(screen.getByText('Đầu vào không hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Đây không phải mã màu HEX hợp lệ. Dùng # theo sau bởi 3 hoặc 6 ký tự hex, vd #f00 hoặc #ff0000.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an invalid-rgb error', () => {
    render(
      <OutputPanel
        result={{ success: false, error: { code: ErrorCodes.INVALID_RGB, message: 'bad' } }}
      />,
    );
    expect(
      screen.getByText(
        'Đây không phải mã màu RGB hợp lệ. Dùng rgb(r, g, b) với mỗi kênh từ 0 đến 255.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an invalid-hsl error', () => {
    render(
      <OutputPanel
        result={{ success: false, error: { code: ErrorCodes.INVALID_HSL, message: 'bad' } }}
      />,
    );
    expect(
      screen.getByText(
        'Đây không phải mã màu HSL hợp lệ. Dùng hsl(h, s%, l%) với hue từ 0-360 và saturation/lightness từ 0-100%.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an unrecognized-format error', () => {
    render(
      <OutputPanel
        result={{
          success: false,
          error: { code: ErrorCodes.INVALID_COLOR_FORMAT, message: 'bad' },
        }}
      />,
    );
    expect(
      screen.getByText('Giá trị này không giống mã màu HEX, RGB hay HSL.'),
    ).toBeInTheDocument();
  });

  it('copies a row value to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<OutputPanel result={successResult} />);

    await user.click(screen.getByRole('button', { name: 'Copy HEX' }));

    expect(writeText).toHaveBeenCalledWith('#ff0000');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Đã sao chép HEX' })).toBeInTheDocument(),
    );
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<OutputPanel result={successResult} />);

    await user.click(screen.getByRole('button', { name: 'Copy RGB' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
