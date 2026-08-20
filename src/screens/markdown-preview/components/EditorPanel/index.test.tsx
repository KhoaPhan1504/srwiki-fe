import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorPanel } from '.';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

const noopToolbarAction = () => ({ text: '', selectionStart: 0, selectionEnd: 0 });

describe('EditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the character and line count for the current value', () => {
    render(
      <EditorPanel
        value={'one\ntwo'}
        onChange={vi.fn()}
        onFileLoaded={vi.fn()}
        onToolbarAction={noopToolbarAction}
      />,
    );
    expect(screen.getByText('7 ký tự')).toBeInTheDocument();
    expect(screen.getByText('2 dòng')).toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <EditorPanel
        value=""
        onChange={onChange}
        onFileLoaded={vi.fn()}
        onToolbarAction={noopToolbarAction}
      />,
    );
    await user.type(screen.getByPlaceholderText('Soạn Markdown tại đây...'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('inserts two spaces and prevents focus loss when Tab is pressed', async () => {
    const onChange = vi.fn();
    render(
      <EditorPanel
        value="ab"
        onChange={onChange}
        onFileLoaded={vi.fn()}
        onToolbarAction={noopToolbarAction}
      />,
    );
    const textarea = screen.getByPlaceholderText('Soạn Markdown tại đây...') as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(1, 1);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    textarea.dispatchEvent(event);
    expect(onChange).toHaveBeenCalledWith('a  b');
    expect(event.defaultPrevented).toBe(true);
  });

  it('calls onToolbarAction with the current selection when a toolbar button is clicked', async () => {
    const onToolbarAction = vi.fn(noopToolbarAction);
    const user = userEvent.setup();
    render(
      <EditorPanel
        value="Hello"
        onChange={vi.fn()}
        onFileLoaded={vi.fn()}
        onToolbarAction={onToolbarAction}
      />,
    );
    const textarea = screen.getByPlaceholderText('Soạn Markdown tại đây...') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5);

    await user.click(screen.getByRole('button', { name: 'Đậm' }));

    expect(onToolbarAction).toHaveBeenCalledWith('bold', 0, 5);
  });

  it('applies the returned selection after a toolbar action updates the value', async () => {
    const onToolbarAction = vi.fn(() => ({
      text: '**Hello**',
      selectionStart: 2,
      selectionEnd: 7,
    }));
    const user = userEvent.setup();
    const { rerender } = render(
      <EditorPanel
        value="Hello"
        onChange={vi.fn()}
        onFileLoaded={vi.fn()}
        onToolbarAction={onToolbarAction}
      />,
    );
    const textarea = screen.getByPlaceholderText('Soạn Markdown tại đây...') as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5);

    await user.click(screen.getByRole('button', { name: 'Đậm' }));

    rerender(
      <EditorPanel
        value="**Hello**"
        onChange={vi.fn()}
        onFileLoaded={vi.fn()}
        onToolbarAction={onToolbarAction}
      />,
    );

    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(7);
  });

  it('reads a valid uploaded .md file and reports its content', async () => {
    const onFileLoaded = vi.fn();
    const { container } = render(
      <EditorPanel
        value=""
        onChange={vi.fn()}
        onFileLoaded={onFileLoaded}
        onToolbarAction={noopToolbarAction}
      />,
    );
    const file = new File(['# Hi'], 'notes.md', { type: 'text/markdown' });
    const user = userEvent.setup();

    await user.upload(getFileInput(container), file);

    await waitFor(() => expect(onFileLoaded).toHaveBeenCalledWith('# Hi'));
  });

  it('rejects an empty uploaded file without calling onFileLoaded', async () => {
    const { toast } = await import('react-toastify');
    const onFileLoaded = vi.fn();
    const { container } = render(
      <EditorPanel
        value=""
        onChange={vi.fn()}
        onFileLoaded={onFileLoaded}
        onToolbarAction={noopToolbarAction}
      />,
    );
    const file = new File([], 'empty.md', { type: 'text/markdown' });
    const user = userEvent.setup();

    await user.upload(getFileInput(container), file);

    expect(onFileLoaded).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('File rỗng.', expect.anything());
  });

  it('rejects a non-Markdown uploaded file without calling onFileLoaded', async () => {
    const { toast } = await import('react-toastify');
    const onFileLoaded = vi.fn();
    const { container } = render(
      <EditorPanel
        value=""
        onChange={vi.fn()}
        onFileLoaded={onFileLoaded}
        onToolbarAction={noopToolbarAction}
      />,
    );
    const file = new File(['hello'], 'notes.pdf', { type: 'application/pdf' });
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(getFileInput(container), file);

    expect(onFileLoaded).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      'Vui lòng tải lên file .md, .markdown hoặc .txt.',
      expect.anything(),
    );
  });
});
