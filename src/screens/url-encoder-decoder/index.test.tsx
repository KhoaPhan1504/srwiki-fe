import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlEncoderDecoderScreen } from './index';

describe('UrlEncoderDecoderScreen', () => {
  it('renders the tool title', () => {
    render(<UrlEncoderDecoderScreen />);
    expect(screen.getByRole('heading', { name: 'URL Encoder / Decoder' })).toBeInTheDocument();
  });

  it('starts in Encode mode and live-encodes typed text', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderDecoderScreen />);

    await user.type(screen.getByLabelText('Đầu vào'), 'hello world');

    expect(screen.getByText('hello%20world')).toBeInTheDocument();
  });

  it('switches to Decode mode and live-decodes the same text field', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderDecoderScreen />);

    await user.click(screen.getByRole('tab', { name: 'Giải mã' }));
    await user.type(screen.getByLabelText('Đầu vào'), 'hello%20world');

    expect(screen.getByText('hello world')).toBeInTheDocument();
  });

  it('shows an error for invalid percent-encoding in Decode mode', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderDecoderScreen />);

    await user.click(screen.getByRole('tab', { name: 'Giải mã' }));
    await user.type(screen.getByLabelText('Đầu vào'), '100% done');

    expect(screen.getByText('Mã hoá không hợp lệ')).toBeInTheDocument();
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<UrlEncoderDecoderScreen />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.type(screen.getByLabelText('Đầu vào'), 'hello');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Đầu vào')).toHaveValue('');
  });
});
