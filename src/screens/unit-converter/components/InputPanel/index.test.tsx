import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { UnitCategory } from '~root/constants';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputPanel } from '.';

const baseProps = {
  category: UnitCategory.LENGTH,
  unit: 'px',
  input: '',
  baseFontSizePx: '16',
  onUnitChange: vi.fn(),
  onInputChange: vi.fn(),
  onBaseFontSizePxChange: vi.fn(),
  onClear: vi.fn(),
};

describe('InputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the placeholder', () => {
    render(<InputPanel {...baseProps} />);
    expect(screen.getByPlaceholderText('vd: 16')).toBeInTheDocument();
  });

  it('calls onInputChange as the user types the value', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    render(<InputPanel {...baseProps} onInputChange={onInputChange} />);
    await user.type(screen.getByLabelText('Giá trị'), '1');
    expect(onInputChange).toHaveBeenCalledWith('1');
  });

  it('lists the units for the current category and calls onUnitChange when one is picked', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(<InputPanel {...baseProps} onUnitChange={onUnitChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'rem' }));

    expect(onUnitChange).toHaveBeenCalledWith('rem');
  });

  it('shows the base font size field for the length category', () => {
    render(<InputPanel {...baseProps} category={UnitCategory.LENGTH} />);
    expect(screen.getByLabelText('Cỡ chữ gốc (px)')).toBeInTheDocument();
  });

  it('hides the base font size field for other categories', () => {
    render(<InputPanel {...baseProps} category={UnitCategory.DATA} unit="B" />);
    expect(screen.queryByLabelText('Cỡ chữ gốc (px)')).not.toBeInTheDocument();
  });

  it('disables Clear when the input is empty, enables it otherwise', () => {
    const { rerender } = render(<InputPanel {...baseProps} input="" />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(<InputPanel {...baseProps} input="16" />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<InputPanel {...baseProps} input="16" onClear={onClear} />);

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
    render(<InputPanel {...baseProps} input="16" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
