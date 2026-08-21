import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MethodUrlBar } from '.';

const baseProps = {
  method: 'GET' as const,
  onMethodChange: vi.fn(),
  url: '',
  onUrlChange: vi.fn(),
  onClear: vi.fn(),
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

  it('lists all 5 supported HTTP methods', async () => {
    const user = userEvent.setup();
    render(<MethodUrlBar {...baseProps} />);

    await user.click(screen.getByRole('combobox', { name: 'Phương thức HTTP' }));
    for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
      expect(screen.getByRole('option', { name: method })).toBeInTheDocument();
    }
  });

  it('disables Clear when the URL is empty', () => {
    render(<MethodUrlBar {...baseProps} url="" />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();
  });

  it('enables Clear once a URL is set', () => {
    render(<MethodUrlBar {...baseProps} url="https://api.example.com" />);
    expect(screen.getByRole('button', { name: 'Xoá' })).toBeEnabled();
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

  it('does not call onClear when the confirmation dialog is cancelled', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<MethodUrlBar {...baseProps} url="https://api.example.com" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Xoá' }));
    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClear).not.toHaveBeenCalled();
  });
});
