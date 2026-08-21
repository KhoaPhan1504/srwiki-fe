import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { ErrorCodes } from '~root/constants';
import type { RestResponse } from '~root/types';
import { ResponsePanel } from '.';

const jsonResponse = (overrides: Partial<RestResponse> = {}): RestResponse => ({
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: { 'content-type': 'application/json' },
  durationMs: 123,
  sizeBytes: 42,
  body: { isJson: true, json: { hello: 'world' }, text: '{"hello":"world"}' },
  ...overrides,
});

describe('ResponsePanel — idle and sending states', () => {
  it('shows an empty placeholder when idle', () => {
    render(<ResponsePanel status="idle" response={null} error={null} />);
    expect(screen.getByText('Gửi một yêu cầu để xem phản hồi ở đây.')).toBeInTheDocument();
  });

  it('shows a sending indicator while the request is in flight', () => {
    render(<ResponsePanel status="sending" response={null} error={null} />);
    expect(screen.getByText('Đang gửi yêu cầu...')).toBeInTheDocument();
  });
});

describe('ResponsePanel — error state', () => {
  it('renders the mapped error message as an alert', () => {
    render(
      <ResponsePanel
        status="error"
        response={null}
        error={{ code: ErrorCodes.NETWORK_ERROR, message: '' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Gửi yêu cầu thất bại — kiểm tra lại URL và kết nối mạng.',
    );
  });
});

describe('ResponsePanel — success state', () => {
  it('shows the status badge with the correct variant, duration and size', () => {
    render(<ResponsePanel status="success" response={jsonResponse()} error={null} />);

    const badge = screen.getByText('200 OK');
    expect(badge).toHaveAttribute('data-variant', 'success');
    expect(screen.getByText('Thời gian: 123 ms')).toBeInTheDocument();
    expect(screen.getByText('Kích thước: 42 B')).toBeInTheDocument();
  });

  it.each([
    [301, 'info'],
    [404, 'warning'],
    [500, 'destructive'],
  ])('uses the %s -> %s badge variant', (status, variant) => {
    render(
      <ResponsePanel
        status="success"
        response={jsonResponse({ status, statusText: '' })}
        error={null}
      />,
    );
    expect(screen.getByText(String(status))).toHaveAttribute('data-variant', variant);
  });

  it('defaults to the Body tab and pretty-prints a JSON body', () => {
    render(<ResponsePanel status="success" response={jsonResponse()} error={null} />);
    expect(screen.getByText(/"hello": "world"/)).toBeInTheDocument();
  });

  it('shows an empty-body message when the response has no body', () => {
    render(
      <ResponsePanel
        status="success"
        response={jsonResponse({ body: { isJson: false, text: '' } })}
        error={null}
      />,
    );
    expect(screen.getByText('Phản hồi không có nội dung.')).toBeInTheDocument();
  });

  it('switches to the Headers tab and lists response headers', async () => {
    const user = userEvent.setup();
    render(<ResponsePanel status="success" response={jsonResponse()} error={null} />);

    await user.click(screen.getByRole('tab', { name: 'Header' }));
    expect(screen.getByText('content-type:')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
  });

  it('shows a no-headers message when the response has none', async () => {
    const user = userEvent.setup();
    render(
      <ResponsePanel status="success" response={jsonResponse({ headers: {} })} error={null} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Header' }));
    expect(screen.getByText('Không có header phản hồi.')).toBeInTheDocument();
  });
});
