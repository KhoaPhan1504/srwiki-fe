import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Base64EncoderDecoderScreen } from './index';

describe('Base64EncoderDecoderScreen', () => {
  it('renders the tool title', () => {
    render(<Base64EncoderDecoderScreen />);
    expect(screen.getByRole('heading', { name: 'Base64 Encoder / Decoder' })).toBeInTheDocument();
  });

  it('starts in Encode mode and live-encodes typed text', async () => {
    const user = userEvent.setup();
    render(<Base64EncoderDecoderScreen />);

    await user.type(screen.getByLabelText('Đầu vào'), 'Hello');

    expect(screen.getByText('SGVsbG8=')).toBeInTheDocument();
  });

  it('switches to Decode mode and live-decodes the same text field', async () => {
    const user = userEvent.setup();
    render(<Base64EncoderDecoderScreen />);

    await user.click(screen.getByRole('tab', { name: 'Giải mã' }));
    await user.type(screen.getByLabelText('Đầu vào'), 'SGVsbG8=');

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows an error for invalid Base64 in Decode mode', async () => {
    const user = userEvent.setup();
    render(<Base64EncoderDecoderScreen />);

    await user.click(screen.getByRole('tab', { name: 'Giải mã' }));
    await user.type(screen.getByLabelText('Đầu vào'), 'not valid base64!!!');

    expect(screen.getByText('Base64 không hợp lệ')).toBeInTheDocument();
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<Base64EncoderDecoderScreen />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    await user.type(screen.getByLabelText('Đầu vào'), 'Hello');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Đầu vào')).toHaveValue('');
  });
});
