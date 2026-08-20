import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputPanel } from '.';

describe('InputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the hint text', () => {
    render(<InputPanel value="" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(
      screen.getByText('Định dạng được tự động nhận diện từ cú pháp HEX, RGB hoặc HSL.'),
    ).toBeInTheDocument();
  });

  it('shows the placeholder', () => {
    render(<InputPanel value="" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(
      screen.getByPlaceholderText('vd: #3a7bd5, rgb(58, 123, 213), hsl(212, 63%, 53%)'),
    ).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputPanel value="" onChange={onChange} onClear={vi.fn()} />);
    await user.type(screen.getByLabelText('Giá trị màu'), '#');
    expect(onChange).toHaveBeenCalledWith('#');
  });

  it('disables Clear when the input is empty, enables it otherwise', () => {
    const { rerender } = render(<InputPanel value="" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(<InputPanel value="#ff0000" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<InputPanel value="#ff0000" onChange={vi.fn()} onClear={onClear} />);

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
    render(<InputPanel value="#ff0000" onChange={vi.fn()} onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
