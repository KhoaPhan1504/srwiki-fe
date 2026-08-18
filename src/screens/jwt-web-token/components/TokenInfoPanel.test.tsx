import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '~root/i18n';
import { TokenInfoPanel } from './TokenInfoPanel';

const NOW = new Date('2026-08-18T10:00:00Z');

describe('TokenInfoPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the empty state when the payload has no standard claims', () => {
    render(<TokenInfoPanel payloadText='{"custom":"value"}' />);
    expect(screen.getByText('Không tìm thấy claim chuẩn nào trong payload.')).toBeInTheDocument();
  });

  it('shows the empty state for invalid JSON', () => {
    render(<TokenInfoPanel payloadText="{invalid" />);
    expect(screen.getByText('Không tìm thấy claim chuẩn nào trong payload.')).toBeInTheDocument();
  });

  it('shows Subject, Issuer and JWT ID when present', () => {
    render(
      <TokenInfoPanel payloadText='{"sub":"user-1","iss":"https://issuer.example.com","jti":"unique-id"}' />,
    );
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('user-1')).toBeInTheDocument();
    expect(screen.getByText('Đơn vị cấp')).toBeInTheDocument();
    expect(screen.getByText('https://issuer.example.com')).toBeInTheDocument();
    expect(screen.getByText('JWT ID')).toBeInTheDocument();
    expect(screen.getByText('unique-id')).toBeInTheDocument();
  });

  it('joins an array audience with commas', () => {
    render(<TokenInfoPanel payloadText='{"aud":["app-a","app-b"]}' />);
    expect(screen.getByText('app-a, app-b')).toBeInTheDocument();
  });

  it('formats iat/exp/nbf as localized dates, not raw numbers', () => {
    render(<TokenInfoPanel payloadText='{"iat":1516239022}' />);
    expect(screen.queryByText('1516239022')).not.toBeInTheDocument();
    expect(screen.getByText('Ngày cấp')).toBeInTheDocument();
  });

  it('shows the active status label alongside exp', () => {
    const exp = Math.floor(NOW.getTime() / 1000) + 3600;
    render(<TokenInfoPanel payloadText={`{"exp":${exp}}`} />);
    expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    expect(screen.getByText('Token đang hoạt động')).toBeInTheDocument();
  });

  it('shows the expired status label alongside exp', () => {
    const exp = Math.floor(NOW.getTime() / 1000) - 3600;
    render(<TokenInfoPanel payloadText={`{"exp":${exp}}`} />);
    expect(screen.getByText('Token đã hết hạn')).toBeInTheDocument();
  });

  it('shows a "valid, no expiration" status when there are claims but no exp', () => {
    render(<TokenInfoPanel payloadText='{"sub":"user-1"}' />);
    expect(screen.getByText('Hợp lệ (không hết hạn)')).toBeInTheDocument();
  });
});
