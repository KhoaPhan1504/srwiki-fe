import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegexTesterScreen } from './index';

describe('RegexTesterScreen', () => {
  it('renders the tool title', () => {
    render(<RegexTesterScreen />);
    expect(screen.getByRole('heading', { name: 'Regex Tester' })).toBeInTheDocument();
  });

  it('disables the Clear button when everything is empty', () => {
    render(<RegexTesterScreen />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });

  it('enables Clear once a pattern is entered, and clears it after confirming', async () => {
    const user = userEvent.setup();
    render(<RegexTesterScreen />);

    await user.type(screen.getByLabelText('Pattern'), 'abc');
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Pattern')).toHaveValue('');
  });
});
