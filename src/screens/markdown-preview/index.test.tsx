import '~root/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownPreviewScreen } from './index';
import { DEBOUNCE_MS } from '~root/constants';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MarkdownPreviewScreen', () => {
  it('renders the tool title', () => {
    render(<MarkdownPreviewScreen />);
    expect(screen.getByRole('heading', { name: 'Markdown Preview' })).toBeInTheDocument();
  });

  it('shows both the editor and the preview in the default split view', () => {
    render(<MarkdownPreviewScreen />);
    expect(screen.getByLabelText('Markdown')).toBeInTheDocument();
    expect(
      screen.getByText('Bắt đầu soạn Markdown để xem trước kết quả tại đây.'),
    ).toBeInTheDocument();
  });

  it('shows only the editor in Editor mode', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<MarkdownPreviewScreen />);

    await user.click(screen.getByRole('button', { name: 'Soạn thảo' }));

    expect(screen.getByLabelText('Markdown')).toBeInTheDocument();
    expect(
      screen.queryByText('Bắt đầu soạn Markdown để xem trước kết quả tại đây.'),
    ).not.toBeInTheDocument();
  });

  it('shows only the preview in Preview mode', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<MarkdownPreviewScreen />);

    await user.click(screen.getByRole('button', { name: 'Xem trước' }));

    expect(screen.queryByLabelText('Markdown')).not.toBeInTheDocument();
    expect(
      screen.getByText('Bắt đầu soạn Markdown để xem trước kết quả tại đây.'),
    ).toBeInTheDocument();
  });

  it('renders typed Markdown into the preview after the debounce settles', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<MarkdownPreviewScreen />);

    await user.type(screen.getByLabelText('Markdown'), '# Hi');
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS);
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Hi' })).toBeInTheDocument();
  });

  it('clears the Markdown content after confirming Clear', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<MarkdownPreviewScreen />);

    await user.type(screen.getByLabelText('Markdown'), '# Hi');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const confirmButtons = screen.getAllByRole('button', { name: 'Clear' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('Markdown')).toHaveValue('');
  });
});
