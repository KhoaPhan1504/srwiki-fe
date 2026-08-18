import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { PayloadPanel } from './PayloadPanel';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

describe('PayloadPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the current payload text in an editable textarea', () => {
    render(<PayloadPanel value='{"sub":"123"}' onChange={vi.fn()} error={null} />);
    expect(screen.getByLabelText('Payload')).toHaveValue('{"sub":"123"}');
  });

  it('calls onChange as the user edits the payload', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PayloadPanel value="" onChange={onChange} error={null} />);

    await user.type(screen.getByLabelText('Payload'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows no error message when error is null', () => {
    render(<PayloadPanel value='{"sub":"123"}' onChange={vi.fn()} error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the invalid JSON error message', () => {
    render(
      <PayloadPanel value='{"sub":' onChange={vi.fn()} error="Unexpected end of JSON input" />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'JSON không hợp lệ: Unexpected end of JSON input',
    );
  });

  it('disables the copy button when there is no payload text', () => {
    render(<PayloadPanel value="" onChange={vi.fn()} error={null} />);
    expect(screen.getByRole('button', { name: 'Copy payload' })).toBeDisabled();
  });

  it('copies the current payload text and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<PayloadPanel value='{"sub":"123"}' onChange={vi.fn()} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy payload' }));

    expect(writeText).toHaveBeenCalledWith('{"sub":"123"}');
    await waitFor(() => expect(screen.getByText('Đã copy payload')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<PayloadPanel value='{"sub":"123"}' onChange={vi.fn()} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy payload' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
