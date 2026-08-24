import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HeaderEntry } from '~root/types';
import { HeaderList } from '.';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

const headers: HeaderEntry[] = [
  { name: 'Content-Type', value: 'application/json' },
  { name: 'Cache-Control', value: 'no-cache' },
  { name: 'X-Custom-Header', value: 'custom-value' },
];

describe('HeaderList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all headers with their values', () => {
    render(<HeaderList headers={headers} />);

    expect(screen.getByText('Content-Type:')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText('Cache-Control:')).toBeInTheDocument();
    expect(screen.getByText('X-Custom-Header:')).toBeInTheDocument();
  });

  it('narrows the list as the user types in the search box', async () => {
    const user = userEvent.setup();
    render(<HeaderList headers={headers} />);

    const search = screen.getByPlaceholderText('Tìm kiếm header…');
    await user.type(search, 'cache');

    expect(screen.getByText('Cache-Control:')).toBeInTheDocument();
    expect(screen.queryByText('Content-Type:')).not.toBeInTheDocument();
    expect(screen.queryByText('X-Custom-Header:')).not.toBeInTheDocument();
  });

  it('restores the full list when the search query is cleared', async () => {
    const user = userEvent.setup();
    render(<HeaderList headers={headers} />);

    const search = screen.getByPlaceholderText('Tìm kiếm header…');
    await user.type(search, 'cache');
    await user.clear(search);

    expect(screen.getByText('Content-Type:')).toBeInTheDocument();
    expect(screen.getByText('Cache-Control:')).toBeInTheDocument();
    expect(screen.getByText('X-Custom-Header:')).toBeInTheDocument();
  });

  it('shows a distinct empty state when there are no headers at all', () => {
    render(<HeaderList headers={[]} />);
    expect(screen.getByText('Không có header nào để hiển thị.')).toBeInTheDocument();
  });

  it('shows a "no results" message when the search matches nothing', async () => {
    const user = userEvent.setup();
    render(<HeaderList headers={headers} />);

    const search = screen.getByPlaceholderText('Tìm kiếm header…');
    await user.type(search, 'does-not-exist');

    expect(
      screen.getByText('Không tìm thấy header nào khớp với tìm kiếm của bạn.'),
    ).toBeInTheDocument();
  });

  it('copies a header value to the clipboard from its row button', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<HeaderList headers={headers} />);

    const copyButtons = screen.getAllByRole('button', { name: 'Sao chép' });
    await user.click(copyButtons[0]);

    expect(writeText).toHaveBeenCalledWith('application/json');
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Đã sao chép' })[0]).toBeInTheDocument(),
    );
  });

  it('does not leak the "copied" confirmation onto a different row when search filtering re-indexes the list', async () => {
    // Regression: rows used to be keyed by `${name}-${filteredIndex}`. With
    // a repeated header name (legitimate, e.g. multiple Set-Cookie), two
    // different header entries can land on the same key across renders once
    // filtering changes the array's composition — causing React to reuse
    // the first row's component instance (and its "copied" state) for the
    // second, unrelated row.
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    const dupNameHeaders: HeaderEntry[] = [
      { name: 'X-Other', value: 'other-value' },
      { name: 'Set-Cookie', value: 'session=a1' },
      { name: 'Set-Cookie', value: 'session=b2' },
    ];
    render(<HeaderList headers={dupNameHeaders} />);

    // Copy the first Set-Cookie row's value (session=a1). Under the old
    // buggy `${name}-${filteredIndex}` key, once X-Other is filtered out,
    // session=b2 shifts into the filtered-array slot session=a1 used to
    // occupy — reusing session=a1's row instance (and its "copied" state).
    const cookieRow = screen.getByText('session=a1').closest('div')?.parentElement as HTMLElement;
    await user.click(within(cookieRow).getByRole('button', { name: 'Sao chép' }));
    expect(writeText).toHaveBeenCalledWith('session=a1');
    await waitFor(() =>
      expect(within(cookieRow).getByRole('button', { name: 'Đã sao chép' })).toBeInTheDocument(),
    );

    // Narrow the list so X-Other drops out, re-indexing the filtered array.
    const search = screen.getByPlaceholderText('Tìm kiếm header…');
    await user.type(search, 'Set-Cookie');

    // The row for session=b2 — which the user never copied — must not show
    // the "copied" confirmation just because it now sits where session=a1
    // used to sit in the filtered array.
    const b2Row = screen.getByText('session=b2').closest('div')?.parentElement as HTMLElement;
    expect(within(b2Row).getByRole('button', { name: 'Sao chép' })).toBeInTheDocument();
    expect(within(b2Row).queryByRole('button', { name: 'Đã sao chép' })).not.toBeInTheDocument();
  });
});
