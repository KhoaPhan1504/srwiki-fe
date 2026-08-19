import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { TokenInputPanel } from './TokenInputPanel';
import { ErrorCodes } from '~root/constants';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

describe('TokenInputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the character count for the current value', () => {
    render(<TokenInputPanel value="abc" onChange={vi.fn()} onClear={vi.fn()} error={null} />);
    expect(screen.getByText('3 ký tự')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TokenInputPanel value="" onChange={onChange} onClear={vi.fn()} error={null} />);
    await user.type(
      screen.getByPlaceholderText(
        'Dán JWT token vào đây, ví dụ: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      ),
      'a',
    );
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('disables Clear when the token is empty, enables it otherwise', () => {
    const { rerender } = render(
      <TokenInputPanel value="" onChange={vi.fn()} onClear={vi.fn()} error={null} />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={vi.fn()} error={null} />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={onClear} error={null} />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Xoá token?')).toBeInTheDocument();
    expect(onClear).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClear).not.toHaveBeenCalled();
    expect(screen.queryByText('Xoá token?')).not.toBeInTheDocument();
  });

  it('calls onClear when the confirmation is accepted', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={onClear} error={null} />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('disables the copy button when there is no token', () => {
    render(<TokenInputPanel value="" onChange={vi.fn()} onClear={vi.fn()} error={null} />);
    expect(screen.getByRole('button', { name: 'Copy token' })).toBeDisabled();
  });

  it('copies the token to the clipboard and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={vi.fn()} error={null} />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy token' }));

    expect(writeText).toHaveBeenCalledWith('aaa.bbb.ccc');
    await waitFor(() => expect(screen.getByText('Đã copy token')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={vi.fn()} error={null} />,
    );

    await user.click(screen.getByRole('button', { name: 'Copy token' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });

  it('shows no error message when error is null', () => {
    render(
      <TokenInputPanel value="aaa.bbb.ccc" onChange={vi.fn()} onClear={vi.fn()} error={null} />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not show an error message for EMPTY_TOKEN (natural empty state, not an error)', () => {
    render(
      <TokenInputPanel
        value=""
        onChange={vi.fn()}
        onClear={vi.fn()}
        error={{ code: ErrorCodes.EMPTY_TOKEN, message: 'Token is empty.' }}
      />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a translated message for INVALID_SEGMENT_COUNT', () => {
    render(
      <TokenInputPanel
        value="not.a.valid.jwt"
        onChange={vi.fn()}
        onClear={vi.fn()}
        error={{ code: ErrorCodes.INVALID_SEGMENT_COUNT, message: 'Expected 3 segments, got 4.' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Định dạng JWT không hợp lệ. JWT phải gồm 3 phần cách nhau bởi dấu chấm.',
    );
  });

  it('shows a translated message for INVALID_BASE64', () => {
    render(
      <TokenInputPanel
        value="aaa.bbb.ccc"
        onChange={vi.fn()}
        onClear={vi.fn()}
        error={{ code: ErrorCodes.INVALID_BASE64, message: 'raw atob error' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Không thể giải mã token — Base64URL không hợp lệ.',
    );
  });

  it('shows a translated message for INVALID_JSON_HEADER', () => {
    render(
      <TokenInputPanel
        value="aaa.bbb.ccc"
        onChange={vi.fn()}
        onClear={vi.fn()}
        error={{ code: ErrorCodes.INVALID_JSON_HEADER, message: 'raw parse error' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Không thể giải mã header JWT thành JSON.');
  });

  it('shows a translated message for INVALID_JSON_PAYLOAD', () => {
    render(
      <TokenInputPanel
        value="aaa.bbb.ccc"
        onChange={vi.fn()}
        onClear={vi.fn()}
        error={{ code: ErrorCodes.INVALID_JSON_PAYLOAD, message: 'raw parse error' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Không thể giải mã payload JWT thành JSON.',
    );
  });
});
