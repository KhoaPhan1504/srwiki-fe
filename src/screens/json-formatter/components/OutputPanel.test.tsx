import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { OutputPanel } from './OutputPanel';

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

  it('shows the empty state when there is no input', () => {
    render(<OutputPanel value="" hasInput={false} error={null} status="idle" />);
    expect(screen.getByText('Dán JSON hoặc tải lên file JSON để bắt đầu.')).toBeInTheDocument();
  });

  it('shows a hint to run an action when there is input but no result yet', () => {
    render(<OutputPanel value="" hasInput error={null} status="idle" />);
    expect(
      screen.getByText('Nhấn Format, Minify hoặc Validate để xem kết quả tại đây.'),
    ).toBeInTheDocument();
  });

  it('shows the valid badge and a follow-up hint when validated but not formatted', () => {
    render(<OutputPanel value="" hasInput error={null} status="valid" />);
    expect(screen.getByText('JSON hợp lệ')).toBeInTheDocument();
    expect(
      screen.getByText('JSON hợp lệ. Nhấn Format hoặc Minify để xem kết quả tại đây.'),
    ).toBeInTheDocument();
  });

  it('renders the formatted output', () => {
    render(<OutputPanel value='{"a":1}' hasInput error={null} status="valid" />);
    expect(screen.getByText('{"a":1}')).toBeInTheDocument();
  });

  it('renders a detailed error instead of the output', () => {
    render(
      <OutputPanel
        value=""
        hasInput
        error={{ code: 'PARSE_ERROR', message: 'Unexpected token', line: 1, column: 8 }}
        status="invalid"
      />,
    );
    expect(screen.getByText('JSON không hợp lệ')).toBeInTheDocument();
    expect(screen.getByText('Dòng 1, cột 8: Unexpected token')).toBeInTheDocument();
  });

  it('disables Copy and Download when there is no output', () => {
    render(<OutputPanel value="" hasInput={false} error={null} status="idle" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download' })).toBeDisabled();
  });

  it('copies the output to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<OutputPanel value='{"a":1}' hasInput error={null} status="valid" />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('{"a":1}');
    await waitFor(() => expect(screen.getByText('Đã sao chép')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<OutputPanel value='{"a":1}' hasInput error={null} status="valid" />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });

  it('triggers a formatted.json download', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<OutputPanel value='{"a":1}' hasInput error={null} status="valid" />);

    await user.click(screen.getByRole('button', { name: 'Download' }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
