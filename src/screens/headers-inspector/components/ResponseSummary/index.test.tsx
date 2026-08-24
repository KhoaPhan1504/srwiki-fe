import { render, screen } from '@testing-library/react';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import type { HeaderInspectionResponse } from '~root/types';
import { ResponseSummary } from '.';

const baseResponse = (
  overrides: Partial<HeaderInspectionResponse> = {},
): HeaderInspectionResponse => ({
  statusCode: 200,
  reasonPhrase: 'OK',
  headers: [],
  finalUrl: 'https://example.com',
  redirectCount: 0,
  durationMs: 123,
  httpVersion: 'HTTP/1.1',
  ...overrides,
});

describe('ResponseSummary', () => {
  it('shows the status badge and formatted duration', () => {
    render(<ResponseSummary response={baseResponse()} requestUrl="https://example.com" />);

    const badge = screen.getByText('200 OK');
    expect(badge).toHaveAttribute('data-variant', 'success');
    expect(screen.getByText('Thời gian: 123 ms')).toBeInTheDocument();
  });

  it.each([
    [200, 'success'],
    [301, 'info'],
    [404, 'warning'],
    [500, 'destructive'],
  ])('uses the %s -> %s badge variant', (statusCode, variant) => {
    render(
      <ResponseSummary
        response={baseResponse({ statusCode, reasonPhrase: '' })}
        requestUrl="https://example.com"
      />,
    );
    expect(screen.getByText(String(statusCode))).toHaveAttribute('data-variant', variant);
  });

  it('hides the final URL when it matches the requested URL', () => {
    render(
      <ResponseSummary
        response={baseResponse({ finalUrl: 'https://example.com' })}
        requestUrl="https://example.com"
      />,
    );
    expect(screen.queryByText(/URL cuối cùng/)).not.toBeInTheDocument();
  });

  it('shows the final URL when a redirect changed it, along with the redirect count', () => {
    render(
      <ResponseSummary
        response={baseResponse({
          finalUrl: 'https://example.com/redirected',
          redirectCount: 2,
        })}
        requestUrl="https://example.com"
      />,
    );
    expect(screen.getByText('URL cuối cùng: https://example.com/redirected')).toBeInTheDocument();
    expect(screen.getByText('Số lần chuyển hướng: 2')).toBeInTheDocument();
  });

  it('shows the final URL without a redirect count when redirectCount is 0', () => {
    render(
      <ResponseSummary
        response={baseResponse({
          finalUrl: 'https://example.com/redirected',
          redirectCount: 0,
        })}
        requestUrl="https://example.com"
      />,
    );
    expect(screen.getByText('URL cuối cùng: https://example.com/redirected')).toBeInTheDocument();
    expect(screen.queryByText(/Số lần chuyển hướng/)).not.toBeInTheDocument();
  });

  it('shows the redirect count even when the redirect chain lands back on the requested URL (finalUrl hidden)', () => {
    // A redirect chain that loops back to its starting URL has
    // finalUrl === requestUrl (so the final-URL line is correctly hidden),
    // but a real redirect still happened — redirectCount must not be gated
    // behind showFinalUrl or it silently disappears.
    render(
      <ResponseSummary
        response={baseResponse({
          finalUrl: 'https://example.com',
          redirectCount: 2,
        })}
        requestUrl="https://example.com"
      />,
    );
    expect(screen.queryByText(/URL cuối cùng/)).not.toBeInTheDocument();
    expect(screen.getByText('Số lần chuyển hướng: 2')).toBeInTheDocument();
  });
});
