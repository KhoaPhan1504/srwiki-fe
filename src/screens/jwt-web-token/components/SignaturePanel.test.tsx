import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { SignaturePanel } from './SignaturePanel';

vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
};

const TOKEN = 'aaa.bbb.the-signature';

describe('SignaturePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the empty state when there is no token', () => {
    render(<SignaturePanel token="" signatureStatus="unknown" />);
    expect(screen.getByText('Chữ ký sẽ hiện ở đây khi có token.')).toBeInTheDocument();
  });

  it('shows the empty state for a malformed token (not 3 segments)', () => {
    render(<SignaturePanel token="aaa.bbb" signatureStatus="unknown" />);
    expect(screen.getByText('Chữ ký sẽ hiện ở đây khi có token.')).toBeInTheDocument();
  });

  it('renders the raw signature segment', () => {
    render(<SignaturePanel token={TOKEN} signatureStatus="unknown" />);
    expect(screen.getByText('the-signature')).toBeInTheDocument();
  });

  it('shows a "Signature Verified" badge when valid', () => {
    render(<SignaturePanel token={TOKEN} signatureStatus="valid" />);
    expect(screen.getByText('Chữ ký Đã xác thực')).toBeInTheDocument();
    expect(screen.queryByText('Chữ ký Không hợp lệ')).not.toBeInTheDocument();
    expect(screen.queryByText('Chưa xác thực')).not.toBeInTheDocument();
  });

  it('shows a "Signature Invalid" badge when invalid', () => {
    render(<SignaturePanel token={TOKEN} signatureStatus="invalid" />);
    expect(screen.getByText('Chữ ký Không hợp lệ')).toBeInTheDocument();
  });

  it('shows a "not verified" badge and a hint when status is unknown but a signature exists', () => {
    render(<SignaturePanel token={TOKEN} signatureStatus="unknown" />);
    expect(screen.getByText('Chưa xác thực')).toBeInTheDocument();
    expect(
      screen.getByText('Nhập secret hoặc public key ở trên để xác thực chữ ký này.'),
    ).toBeInTheDocument();
  });

  it('does not show any badge when there is no signature yet', () => {
    render(<SignaturePanel token="" signatureStatus="unknown" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('disables the copy button when there is no signature', () => {
    render(<SignaturePanel token="" signatureStatus="unknown" />);
    expect(screen.getByRole('button', { name: 'Sao chép chữ ký' })).toBeDisabled();
  });

  it('copies the raw signature and shows a temporary confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<SignaturePanel token={TOKEN} signatureStatus="valid" />);

    await user.click(screen.getByRole('button', { name: 'Sao chép chữ ký' }));

    expect(writeText).toHaveBeenCalledWith('the-signature');
    await waitFor(() => expect(screen.getByText('Đã copy chữ ký')).toBeInTheDocument());
  });

  it('shows a toast if copying to the clipboard fails', async () => {
    const { toast } = await import('react-toastify');
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    render(<SignaturePanel token={TOKEN} signatureStatus="valid" />);

    await user.click(screen.getByRole('button', { name: 'Sao chép chữ ký' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Không thể sao chép vào clipboard.',
        expect.anything(),
      ),
    );
  });
});
