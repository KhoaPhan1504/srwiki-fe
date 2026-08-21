import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Environment } from '~root/types';
import { MethodUrlBar } from '.';

const baseProps = {
  method: 'GET' as const,
  onMethodChange: vi.fn(),
  url: '',
  onUrlChange: vi.fn(),
  status: 'idle' as const,
  onSend: vi.fn(),
  onCancel: vi.fn(),
  onClear: vi.fn(),
  onSave: vi.fn(),
  environments: [] as Environment[],
  environmentId: null,
  onEnvironmentIdChange: vi.fn(),
  onManageEnvironments: vi.fn(),
};

describe('MethodUrlBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the URL placeholder and calls onUrlChange as the user types', async () => {
    const user = userEvent.setup();
    const onUrlChange = vi.fn();
    render(<MethodUrlBar {...baseProps} onUrlChange={onUrlChange} />);

    const input = screen.getByPlaceholderText('https://api.example.com/users');
    await user.type(input, 'a');
    expect(onUrlChange).toHaveBeenCalledWith('a');
  });

  it('calls onMethodChange when a different method is picked', async () => {
    const user = userEvent.setup();
    const onMethodChange = vi.fn();
    render(<MethodUrlBar {...baseProps} onMethodChange={onMethodChange} />);

    await user.click(screen.getByRole('combobox', { name: 'Phương thức HTTP' }));
    await user.click(screen.getByRole('option', { name: 'POST' }));

    expect(onMethodChange).toHaveBeenCalledWith('POST');
  });

  it('disables Send when the URL is empty and enables it once a URL is set', () => {
    const { rerender } = render(<MethodUrlBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeDisabled();

    rerender(<MethodUrlBar {...baseProps} url="https://api.example.com" />);
    expect(screen.getByRole('button', { name: 'Gửi' })).toBeEnabled();
  });

  it('calls onSend when Send is clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MethodUrlBar {...baseProps} url="https://api.example.com" onSend={onSend} />);

    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('shows a Cancel button and the sending label while sending, and calls onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <MethodUrlBar
        {...baseProps}
        url="https://api.example.com"
        status="sending"
        onCancel={onCancel}
      />,
    );

    expect(screen.getByRole('button', { name: 'Đang gửi...' })).toBeDisabled();
    const cancelButton = screen.getByRole('button', { name: 'Huỷ' });
    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not show a Cancel button when idle', () => {
    render(<MethodUrlBar {...baseProps} status="idle" />);
    expect(screen.queryByRole('button', { name: 'Huỷ' })).not.toBeInTheDocument();
  });

  it('disables Clear when the URL is empty', () => {
    render(<MethodUrlBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
  });

  it('calls onSave when Save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MethodUrlBar {...baseProps} url="https://api.example.com" onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables Save when the URL is empty', () => {
    render(<MethodUrlBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeDisabled();
  });

  it('renders the environment selector', () => {
    render(<MethodUrlBar {...baseProps} />);
    expect(screen.getByText('Không có Environment')).toBeInTheDocument();
  });

  it('asks for confirmation and only calls onClear once confirmed', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<MethodUrlBar {...baseProps} url="https://api.example.com" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(screen.getByText('Xoá yêu cầu này?')).toBeInTheDocument();
    expect(onClear).not.toHaveBeenCalled();

    const confirmButtons = screen.getAllByRole('button', { name: 'Xoá' });
    await user.click(confirmButtons[confirmButtons.length - 1]);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
