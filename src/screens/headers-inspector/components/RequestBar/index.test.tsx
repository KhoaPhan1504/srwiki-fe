import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestBar } from '.';

const baseProps = {
  url: '',
  onUrlChange: vi.fn(),
  status: 'idle' as const,
  hasResult: false,
  onSend: vi.fn(),
  onClear: vi.fn(),
};

describe('RequestBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the URL placeholder and calls onUrlChange as the user types', async () => {
    const user = userEvent.setup();
    const onUrlChange = vi.fn();
    render(<RequestBar {...baseProps} onUrlChange={onUrlChange} />);

    const input = screen.getByPlaceholderText('https://example.com');
    await user.type(input, 'a');
    expect(onUrlChange).toHaveBeenCalledWith('a');
  });

  it('disables Inspect when the URL is empty', () => {
    render(<RequestBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toBeDisabled();
  });

  it('enables Inspect once a URL is set', () => {
    render(<RequestBar {...baseProps} url="https://example.com" />);
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toBeEnabled();
  });

  it('calls onSend when Inspect is clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<RequestBar {...baseProps} url="https://example.com" onSend={onSend} />);

    await user.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('shows the spinning loader and disables Inspect while sending', () => {
    render(<RequestBar {...baseProps} url="https://example.com" status="sending" />);
    expect(screen.getByRole('button', { name: 'Đang kiểm tra...' })).toBeDisabled();
  });

  it('disables Clear when the URL is empty', () => {
    render(<RequestBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
  });

  it('enables Clear once a URL is set', () => {
    render(<RequestBar {...baseProps} url="https://example.com" />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeEnabled();
  });

  it('enables Clear when a result exists even though the URL input was cleared back to empty', () => {
    // Regression: inspecting a URL then select-all + delete-ing the input
    // text left Clear disabled (it only checked `!url`), with no way to
    // dismiss the still-visible stale result.
    render(<RequestBar {...baseProps} url="" hasResult />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeEnabled();
  });

  it('asks for confirmation and only calls onClear once confirmed', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<RequestBar {...baseProps} url="https://example.com" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(screen.getByText('Xoá yêu cầu này?')).toBeInTheDocument();
    expect(onClear).not.toHaveBeenCalled();

    const confirmButtons = screen.getAllByRole('button', { name: 'Xoá' });
    await user.click(confirmButtons[confirmButtons.length - 1]);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not call onClear when the confirmation dialog is cancelled', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<RequestBar {...baseProps} url="https://example.com" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClear).not.toHaveBeenCalled();
  });
});
