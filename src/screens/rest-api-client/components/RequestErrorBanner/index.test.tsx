import { render, screen } from '@testing-library/react';
import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { ErrorCodes } from '~root/constants';
import { RequestErrorBanner } from '.';

describe('RequestErrorBanner', () => {
  it('renders as an alert', () => {
    render(<RequestErrorBanner error={{ code: ErrorCodes.INVALID_URL, message: '' }} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it.each([
    [ErrorCodes.EMPTY_INPUT, 'Nhập URL yêu cầu.'],
    [ErrorCodes.INVALID_URL, 'Nhập một URL hợp lệ, ví dụ https://api.example.com.'],
    [ErrorCodes.INVALID_JSON_BODY, 'Nội dung yêu cầu phải là JSON hợp lệ.'],
    [ErrorCodes.INVALID_HEADER_KEY, 'Tên header này không hợp lệ.'],
    [ErrorCodes.NETWORK_ERROR, 'Gửi yêu cầu thất bại — kiểm tra lại URL và kết nối mạng.'],
    [ErrorCodes.REQUEST_TIMEOUT, 'Yêu cầu đã hết thời gian chờ sau 30 giây.'],
    [ErrorCodes.REQUEST_ABORTED, 'Đã huỷ yêu cầu.'],
  ])('shows the message for %s', (code, expected) => {
    render(<RequestErrorBanner error={{ code, message: '' }} />);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('falls back to the network-error message for an unmapped code', () => {
    render(<RequestErrorBanner error={{ code: ErrorCodes.INVALID_NUMBER, message: '' }} />);
    expect(
      screen.getByText('Gửi yêu cầu thất bại — kiểm tra lại URL và kết nối mạng.'),
    ).toBeInTheDocument();
  });
});
