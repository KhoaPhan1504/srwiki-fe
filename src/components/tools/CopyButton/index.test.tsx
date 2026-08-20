import '~root/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { CopyButton } from './index';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('CopyButton', () => {
  it('copies the value and shows the copied label', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    render(<CopyButton value="/abc/g" label="Copy" copiedLabel="Copied" errorMessage="Failed" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('/abc/g');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument());
  });

  it('shows an error toast when the clipboard write fails', async () => {
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    render(<CopyButton value="/abc/g" label="Copy" copiedLabel="Copied" errorMessage="Failed" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Failed', { position: 'bottom-center' }),
    );
  });

  it('is disabled when disabled is true', () => {
    render(
      <CopyButton value="" label="Copy" copiedLabel="Copied" errorMessage="Failed" disabled />,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
  });
});
