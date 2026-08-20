import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes, TimestampConversionMode } from '~root/constants';
import { getIntlLocaleTag } from '~root/i18n/dateLocale';
import { OutputPanel } from '.';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

const locale = getIntlLocaleTag('vi' as never);
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const getRow = (labelText: string): HTMLElement => {
  const row = screen.getByText(labelText).closest('li');
  if (!row) throw new Error(`Row for label "${labelText}" not found`);
  return row;
};

describe('OutputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the Timestamp → Date empty state when there is no result', () => {
    render(
      <OutputPanel
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        timestampToDateResult={null}
        dateToTimestampResult={null}
      />,
    );
    expect(screen.getByText('Nhập Unix timestamp để chuyển đổi.')).toBeInTheDocument();
  });

  it('shows the Date → Timestamp empty state when there is no result', () => {
    render(
      <OutputPanel
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        timestampToDateResult={null}
        dateToTimestampResult={null}
      />,
    );
    expect(screen.getByText('Nhập ngày giờ để chuyển đổi.')).toBeInTheDocument();
  });

  it('renders Local/UTC/ISO rows for a successful Timestamp → Date result', () => {
    const date = new Date(0);
    render(
      <OutputPanel
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        timestampToDateResult={{ success: true, date, milliseconds: 0 }}
        dateToTimestampResult={null}
      />,
    );

    expect(
      within(getRow(`Giờ địa phương (${localZone})`)).getByText(
        new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'medium' }).format(date),
      ),
    ).toBeInTheDocument();
    expect(
      within(getRow('UTC')).getByText(
        new Intl.DateTimeFormat(locale, {
          dateStyle: 'long',
          timeStyle: 'medium',
          timeZone: 'UTC',
        }).format(date),
      ),
    ).toBeInTheDocument();
    expect(within(getRow('ISO 8601')).getByText(date.toISOString())).toBeInTheDocument();
  });

  it('renders seconds/milliseconds rows for a successful Date → Timestamp result', () => {
    render(
      <OutputPanel
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        timestampToDateResult={null}
        dateToTimestampResult={{ success: true, seconds: 1700000000, milliseconds: 1700000000000 }}
      />,
    );

    expect(screen.getByText('1700000000')).toBeInTheDocument();
    expect(screen.getByText('1700000000000')).toBeInTheDocument();
  });

  it('shows an invalid-timestamp error', () => {
    render(
      <OutputPanel
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        timestampToDateResult={{
          success: false,
          error: { code: ErrorCodes.INVALID_TIMESTAMP, message: 'bad' },
        }}
        dateToTimestampResult={null}
      />,
    );
    expect(screen.getByText('Đầu vào không hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Đây không phải timestamp hợp lệ. Nhập số nguyên hoặc số thập phân biểu thị giây hoặc mili giây.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an invalid-date error', () => {
    render(
      <OutputPanel
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        timestampToDateResult={null}
        dateToTimestampResult={{
          success: false,
          error: { code: ErrorCodes.INVALID_DATE, message: 'bad' },
        }}
      />,
    );
    expect(screen.getByText('Đầu vào không hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Không nhận diện được định dạng ngày giờ này. Dùng YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss, hoặc chuỗi ISO 8601 kèm offset.',
      ),
    ).toBeInTheDocument();
  });

  it('copies a row value to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(
      <OutputPanel
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        timestampToDateResult={null}
        dateToTimestampResult={{ success: true, seconds: 1700000000, milliseconds: 1700000000000 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Unix timestamp \(giây\)/ }));

    expect(writeText).toHaveBeenCalledWith('1700000000');
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
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        timestampToDateResult={null}
        dateToTimestampResult={{ success: true, seconds: 1700000000, milliseconds: 1700000000000 }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Unix timestamp \(giây\)/ }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
