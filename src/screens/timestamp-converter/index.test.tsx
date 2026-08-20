import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { TimestampConverterScreen } from './index';

describe('TimestampConverterScreen', () => {
  it('renders the tool title', () => {
    render(<TimestampConverterScreen />);
    expect(screen.getByRole('heading', { name: 'Timestamp Converter' })).toBeInTheDocument();
  });

  it('starts in Timestamp → Date mode and live-converts a seconds timestamp', async () => {
    const user = userEvent.setup();
    render(<TimestampConverterScreen />);

    await user.type(screen.getByLabelText('Unix timestamp'), '0');

    expect(screen.getByText(new Date(0).toISOString())).toBeInTheDocument();
  });

  it('switches to Date → Timestamp mode and converts a UTC date string', async () => {
    const user = userEvent.setup();
    render(<TimestampConverterScreen />);

    await user.click(screen.getByRole('tab', { name: 'Ngày giờ → Timestamp' }));
    await user.click(screen.getByRole('radio', { name: 'UTC' }));
    await user.type(screen.getByLabelText('Ngày / giờ'), '2024-01-15T00:00:00');

    expect(screen.getByText(String(Date.UTC(2024, 0, 15) / 1000))).toBeInTheDocument();
  });

  it('shows an error for an unrecognized date string', async () => {
    const user = userEvent.setup();
    render(<TimestampConverterScreen />);

    await user.click(screen.getByRole('tab', { name: 'Ngày giờ → Timestamp' }));
    await user.type(screen.getByLabelText('Ngày / giờ'), 'not a date');

    expect(screen.getByText('Đầu vào không hợp lệ')).toBeInTheDocument();
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<TimestampConverterScreen />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.type(screen.getByLabelText('Unix timestamp'), '0');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Unix timestamp')).toHaveValue('');
  });
});
