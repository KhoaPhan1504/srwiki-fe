import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { ColorConverterScreen } from './index';

describe('ColorConverterScreen', () => {
  it('renders the tool title', () => {
    render(<ColorConverterScreen />);
    expect(screen.getByRole('heading', { name: 'Chuyển đổi màu' })).toBeInTheDocument();
  });

  it('live-converts a hex input to RGB and HSL', async () => {
    const user = userEvent.setup();
    render(<ColorConverterScreen />);

    await user.type(screen.getByLabelText('Giá trị màu'), '#ff0000');

    expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument();
    expect(screen.getByText('hsl(0, 100%, 50%)')).toBeInTheDocument();
  });

  it('shows an error for an invalid color', async () => {
    const user = userEvent.setup();
    render(<ColorConverterScreen />);

    await user.type(screen.getByLabelText('Giá trị màu'), 'not-a-color');

    expect(screen.getByText('Đầu vào không hợp lệ')).toBeInTheDocument();
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<ColorConverterScreen />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.type(screen.getByLabelText('Giá trị màu'), '#ff0000');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Giá trị màu')).toHaveValue('');
  });
});
