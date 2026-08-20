import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { UnitConverterScreen } from './index';

describe('UnitConverterScreen', () => {
  it('renders the tool title', () => {
    render(<UnitConverterScreen />);
    expect(screen.getByRole('heading', { name: 'Chuyển đổi đơn vị' })).toBeInTheDocument();
  });

  it('live-converts a length input to the other length units', async () => {
    const user = userEvent.setup();
    render(<UnitConverterScreen />);

    await user.type(screen.getByLabelText('Giá trị'), '16');

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('switches category and shows the units for the new category', async () => {
    const user = userEvent.setup();
    render(<UnitConverterScreen />);

    await user.click(screen.getByRole('tab', { name: 'Dung lượng' }));
    await user.type(screen.getByLabelText('Giá trị'), '1');

    expect(screen.getByText('0.001')).toBeInTheDocument();
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<UnitConverterScreen />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.type(screen.getByLabelText('Giá trị'), '16');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Giá trị')).toHaveValue('');
  });
});
