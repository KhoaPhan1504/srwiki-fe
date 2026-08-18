import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { HeaderPanel } from './HeaderPanel';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

describe('HeaderPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the current header text in an editable textarea', () => {
    render(<HeaderPanel value='{"alg":"HS256"}' onChange={vi.fn()} error={null} />);
    expect(screen.getByLabelText('Header')).toHaveValue('{"alg":"HS256"}');
  });

  it('calls onChange as the user edits the header', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<HeaderPanel value="" onChange={onChange} error={null} />);

    await user.type(screen.getByLabelText('Header'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows no error message when error is null', () => {
    render(<HeaderPanel value='{"alg":"HS256"}' onChange={vi.fn()} error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the invalid JSON error message', () => {
    render(<HeaderPanel value='{"alg":' onChange={vi.fn()} error="Unexpected end of JSON input" />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'JSON không hợp lệ: Unexpected end of JSON input',
    );
  });

  it('disables the copy button when there is no header text', () => {
    render(<HeaderPanel value="" onChange={vi.fn()} error={null} />);
    expect(screen.getByRole('button', { name: 'Copy header' })).toBeDisabled();
  });

  it('copies the current header text and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<HeaderPanel value='{"alg":"HS256","typ":"JWT"}' onChange={vi.fn()} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy header' }));

    expect(writeText).toHaveBeenCalledWith('{"alg":"HS256","typ":"JWT"}');
    await waitFor(() => expect(screen.getByText('Đã copy header')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<HeaderPanel value='{"alg":"HS256"}' onChange={vi.fn()} error={null} />);

    await user.click(screen.getByRole('button', { name: 'Copy header' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
