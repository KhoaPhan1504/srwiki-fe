import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { ResultsPanel } from '.';
import { UUIDVersion } from '~root/constants';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

const sampleResults = [
  '550e8400-e29b-41d4-a716-446655440000',
  '6ba7b810-9dad-41d4-9873-3b4c5d8e9f10',
];

describe('ResultsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty state when there are no results', () => {
    render(<ResultsPanel results={[]} version={UUIDVersion.V4} onClear={vi.fn()} />);
    expect(screen.getByText('Chưa có UUID nào được tạo.')).toBeInTheDocument();
  });

  it('does not show Copy All when there are no results', () => {
    render(<ResultsPanel results={[]} version={UUIDVersion.V4} onClear={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Copy All' })).not.toBeInTheDocument();
  });

  it('renders every generated UUID with its own Copy button', () => {
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={vi.fn()} />);
    sampleResults.forEach((uuid) => {
      expect(screen.getByText(uuid)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `Copy ${uuid}` })).toBeInTheDocument();
    });
  });

  it('shows the count and version stats', () => {
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V7} onClear={vi.fn()} />);
    expect(screen.getByText('2 UUID được tạo')).toBeInTheDocument();
    expect(screen.getByText('Phiên bản: UUID v7')).toBeInTheDocument();
  });

  it('copies a single UUID and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: `Copy ${sampleResults[0]}` }));

    expect(writeText).toHaveBeenCalledWith(sampleResults[0]);
    await waitFor(() => expect(screen.getByText('Đã sao chép')).toBeInTheDocument());
  });

  it('copies all UUIDs joined by newlines and shows a success toast', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Copy All' }));

    expect(writeText).toHaveBeenCalledWith(sampleResults.join('\n'));
    expect(toast.success).toHaveBeenCalledWith('Đã sao chép tất cả UUID.', expect.anything());
  });

  it('shows a toast if copying fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Copy All' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });

  it('triggers a uuids.txt download containing all results', async () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Download' }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('calls onClear when Clear is clicked', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<ResultsPanel results={sampleResults} version={UUIDVersion.V4} onClear={onClear} />);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
