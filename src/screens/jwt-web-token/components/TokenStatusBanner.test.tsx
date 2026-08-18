import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '~root/i18n';
import { TokenStatusBanner } from './TokenStatusBanner';

const NOW = new Date('2026-08-18T10:00:00Z');

describe('TokenStatusBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing for invalid JSON payload text', () => {
    const { container } = render(<TokenStatusBanner payloadText="{invalid" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for a non-object payload', () => {
    const { container } = render(<TokenStatusBanner payloadText="[1,2,3]" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows "no expiration" for a payload without exp', () => {
    render(<TokenStatusBanner payloadText='{"sub":"123"}' />);
    expect(screen.getByText('Không có claim hết hạn (exp)')).toBeInTheDocument();
  });

  it('shows an active state with a relative "expires" time', () => {
    const exp = Math.floor(NOW.getTime() / 1000) + 3600;
    render(<TokenStatusBanner payloadText={`{"exp":${exp}}`} />);
    expect(screen.getByText('Token đang hoạt động')).toBeInTheDocument();
    expect(screen.getByText(/Hết hạn/)).toBeInTheDocument();
  });

  it('shows an expired state with a relative "expired ago" time', () => {
    const exp = Math.floor(NOW.getTime() / 1000) - 3600;
    render(<TokenStatusBanner payloadText={`{"exp":${exp}}`} />);
    expect(screen.getByText('Token đã hết hạn')).toBeInTheDocument();
    expect(screen.getByText(/Đã hết hạn/)).toBeInTheDocument();
  });

  it('shows a not-yet-valid state when nbf is in the future', () => {
    const nbf = Math.floor(NOW.getTime() / 1000) + 600;
    render(<TokenStatusBanner payloadText={`{"nbf":${nbf}}`} />);
    expect(screen.getByText('Token chưa có hiệu lực')).toBeInTheDocument();
    expect(screen.getByText(/Bắt đầu/)).toBeInTheDocument();
  });

  it('prioritizes not-yet-valid over an active exp', () => {
    const nbf = Math.floor(NOW.getTime() / 1000) + 600;
    const exp = Math.floor(NOW.getTime() / 1000) + 3600;
    render(<TokenStatusBanner payloadText={`{"nbf":${nbf},"exp":${exp}}`} />);
    expect(screen.getByText('Token chưa có hiệu lực')).toBeInTheDocument();
  });
});
