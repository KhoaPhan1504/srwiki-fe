import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { InputPanel } from '.';
import { OperationMode } from '~root/constants';

describe('InputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the character count for the current value', () => {
    render(
      <InputPanel value="ab" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByText('2 ký tự')).toBeInTheDocument();
  });

  it('shows the encode placeholder in encode mode', () => {
    render(
      <InputPanel value="" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByPlaceholderText('Nhập văn bản cần mã hoá...')).toBeInTheDocument();
  });

  it('shows the decode placeholder in decode mode', () => {
    render(
      <InputPanel value="" mode={OperationMode.DECODE} onChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(
      screen.getByPlaceholderText('Dán chuỗi đã mã hoá URL cần giải mã...'),
    ).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <InputPanel value="" mode={OperationMode.ENCODE} onChange={onChange} onClear={vi.fn()} />,
    );
    await user.type(screen.getByPlaceholderText('Nhập văn bản cần mã hoá...'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('disables Clear when the input is empty, enables it otherwise', () => {
    const { rerender } = render(
      <InputPanel value="" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(
      <InputPanel value="a" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <InputPanel value="a" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={onClear} />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Xoá nội dung đầu vào?')).toBeInTheDocument();
    expect(onClear).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClear).not.toHaveBeenCalled();
    expect(screen.queryByText('Xoá nội dung đầu vào?')).not.toBeInTheDocument();
  });

  it('calls onClear when the confirmation is accepted', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <InputPanel value="a" mode={OperationMode.ENCODE} onChange={vi.fn()} onClear={onClear} />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
