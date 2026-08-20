import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TimestampConversionMode, TimestampUnit } from '~root/constants';
import { InputPanel } from '.';

const baseProps = {
  input: '',
  unit: TimestampUnit.SECONDS,
  timezoneMode: 'local' as const,
  onInputChange: vi.fn(),
  onUnitChange: vi.fn(),
  onTimezoneModeChange: vi.fn(),
  onClear: vi.fn(),
};

describe('InputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the unit selector and timestamp placeholder in Timestamp → Date mode', () => {
    render(<InputPanel {...baseProps} mode={TimestampConversionMode.TIMESTAMP_TO_DATE} />);
    expect(screen.getByRole('radio', { name: 'Giây' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Mili giây' })).not.toBeChecked();
    expect(screen.getByPlaceholderText('vd: 1700000000')).toBeInTheDocument();
  });

  it('shows the timezone selector and date placeholder in Date → Timestamp mode', () => {
    render(<InputPanel {...baseProps} mode={TimestampConversionMode.DATE_TO_TIMESTAMP} />);
    expect(screen.getByRole('radio', { name: 'Giờ địa phương' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'UTC' })).not.toBeChecked();
    expect(screen.getByPlaceholderText('vd: 2024-01-15T10:30:00')).toBeInTheDocument();
  });

  it('calls onInputChange as the user types', async () => {
    const user = userEvent.setup();
    const onInputChange = vi.fn();
    render(
      <InputPanel
        {...baseProps}
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        onInputChange={onInputChange}
      />,
    );
    await user.type(screen.getByLabelText('Unix timestamp'), '1');
    expect(onInputChange).toHaveBeenCalledWith('1');
  });

  it('calls onUnitChange when selecting a different unit', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(
      <InputPanel
        {...baseProps}
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        onUnitChange={onUnitChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'Mili giây' }));
    expect(onUnitChange).toHaveBeenCalledWith(TimestampUnit.MILLISECONDS);
  });

  it('calls onTimezoneModeChange when selecting UTC', async () => {
    const user = userEvent.setup();
    const onTimezoneModeChange = vi.fn();
    render(
      <InputPanel
        {...baseProps}
        mode={TimestampConversionMode.DATE_TO_TIMESTAMP}
        onTimezoneModeChange={onTimezoneModeChange}
      />,
    );
    await user.click(screen.getByRole('radio', { name: 'UTC' }));
    expect(onTimezoneModeChange).toHaveBeenCalledWith('UTC');
  });

  it('disables Clear when the input is empty, enables it otherwise', () => {
    const { rerender } = render(
      <InputPanel {...baseProps} mode={TimestampConversionMode.TIMESTAMP_TO_DATE} input="" />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(
      <InputPanel {...baseProps} mode={TimestampConversionMode.TIMESTAMP_TO_DATE} input="0" />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <InputPanel
        {...baseProps}
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        input="0"
        onClear={onClear}
      />,
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
      <InputPanel
        {...baseProps}
        mode={TimestampConversionMode.TIMESTAMP_TO_DATE}
        input="0"
        onClear={onClear}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
