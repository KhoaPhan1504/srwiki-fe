import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { InputPanel } from './InputPanel';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('InputPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the character count for the current value', () => {
    render(<InputPanel value="{}" onChange={vi.fn()} onFileLoaded={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('2 ký tự')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputPanel value="" onChange={onChange} onFileLoaded={vi.fn()} onClear={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('Dán JSON vào đây...'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('disables Clear when the input is empty, enables it otherwise', () => {
    const { rerender } = render(
      <InputPanel value="" onChange={vi.fn()} onFileLoaded={vi.fn()} onClear={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();

    rerender(<InputPanel value="{}" onChange={vi.fn()} onFileLoaded={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Clear' })).toBeEnabled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<InputPanel value="{}" onChange={vi.fn()} onFileLoaded={vi.fn()} onClear={onClear} />);

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
    render(<InputPanel value="{}" onChange={vi.fn()} onFileLoaded={vi.fn()} onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('reads a valid uploaded .json file and reports its content', async () => {
    const onFileLoaded = vi.fn();
    const { container } = render(
      <InputPanel value="" onChange={vi.fn()} onFileLoaded={onFileLoaded} onClear={vi.fn()} />,
    );
    const file = new File(['{"a":1}'], 'data.json', { type: 'application/json' });
    const user = userEvent.setup();

    await user.upload(getFileInput(container), file);

    await waitFor(() => expect(onFileLoaded).toHaveBeenCalledWith('{"a":1}'));
  });

  it('rejects an empty uploaded file without calling onFileLoaded', async () => {
    const { toast } = await import('react-toastify');
    const onFileLoaded = vi.fn();
    const { container } = render(
      <InputPanel value="" onChange={vi.fn()} onFileLoaded={onFileLoaded} onClear={vi.fn()} />,
    );
    const file = new File([], 'empty.json', { type: 'application/json' });
    const user = userEvent.setup();

    await user.upload(getFileInput(container), file);

    expect(onFileLoaded).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('File rỗng.', expect.anything());
  });

  it('rejects a non-JSON uploaded file without calling onFileLoaded', async () => {
    const { toast } = await import('react-toastify');
    const onFileLoaded = vi.fn();
    const { container } = render(
      <InputPanel value="" onChange={vi.fn()} onFileLoaded={onFileLoaded} onClear={vi.fn()} />,
    );
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    // The real <input accept> already stops most non-JSON files at the native
    // picker; applyAccept: false exercises the component's own defense-in-depth
    // guard for cases where that filtering is bypassed (e.g. drag-and-drop).
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(getFileInput(container), file);

    expect(onFileLoaded).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Vui lòng tải lên file .json.', expect.anything());
  });
});
