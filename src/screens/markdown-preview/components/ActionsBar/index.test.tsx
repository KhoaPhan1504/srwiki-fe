import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionsBar } from '.';

describe('ActionsBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disables Copy and both downloads when there is no markdown content', () => {
    render(<ActionsBar markdown="" html="" onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tải xuống .md' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Tải xuống .html' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled();
  });

  it('copies the markdown source to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ActionsBar markdown="# Hello" html="<h1>Hello</h1>" onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith('# Hello');
  });

  it('triggers a .md download of the raw markdown source', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<ActionsBar markdown="# Hello" html="<h1>Hello</h1>" onClear={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Tải xuống .md' }));

    expect(createObjectURL).toHaveBeenCalled();
    const [blob] = createObjectURL.mock.calls[0] as [Blob];
    expect(blob.type).toBe('text/markdown');
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('triggers a standalone .html download of the rendered preview', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();

    render(<ActionsBar markdown="# Hello" html="<h1>Hello</h1>" onClear={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Tải xuống .html' }));

    expect(createObjectURL).toHaveBeenCalled();
    const [blob] = createObjectURL.mock.calls[0] as [Blob];
    expect(blob.type).toBe('text/html');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('asks for confirmation before clearing, and only clears on confirm', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ActionsBar markdown="# Hello" html="<h1>Hello</h1>" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Xoá toàn bộ nội dung?')).toBeInTheDocument();
    expect(onClear).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onClear).not.toHaveBeenCalled();
  });

  it('calls onClear when the confirmation is accepted', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ActionsBar markdown="# Hello" html="<h1>Hello</h1>" onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
