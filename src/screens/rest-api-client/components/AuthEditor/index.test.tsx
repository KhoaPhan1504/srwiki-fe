import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthConfig } from '~root/types';
import { AuthEditor } from '.';

describe('AuthEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the no-auth description when type is none', () => {
    render(<AuthEditor auth={{ type: 'none' }} onChange={vi.fn()} />);
    expect(screen.getByText('Yêu cầu này sẽ không gửi thông tin xác thực.')).toBeInTheDocument();
  });

  it('switches to Bearer Token and reports a fresh bearer config', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AuthEditor auth={{ type: 'none' }} onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Bearer Token' }));

    expect(onChange).toHaveBeenCalledWith({ type: 'bearer', token: '' });
  });

  it('shows the token field for bearer auth and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AuthEditor auth={{ type: 'bearer', token: '' }} onChange={onChange} />);

    const input = screen.getByLabelText('Token');
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalledWith({ type: 'bearer', token: 'a' });
  });

  it('shows username/password fields for basic auth, masking the password', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AuthEditor auth={{ type: 'basic', username: '', password: '' }} onChange={onChange} />);

    await user.type(screen.getByLabelText('Tên đăng nhập'), 'a');
    expect(onChange).toHaveBeenCalledWith({ type: 'basic', username: 'a', password: '' });

    const passwordInput = screen.getByLabelText('Mật khẩu');
    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.type(passwordInput, 'b');
    expect(onChange).toHaveBeenCalledWith({ type: 'basic', username: '', password: 'b' });
  });

  it('shows key/value/addTo fields for API key auth and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const auth: AuthConfig = { type: 'apiKey', key: '', value: '', addTo: 'header' };
    render(<AuthEditor auth={auth} onChange={onChange} />);

    await user.type(screen.getByLabelText('Tên key'), 'a');
    expect(onChange).toHaveBeenCalledWith({ type: 'apiKey', key: 'a', value: '', addTo: 'header' });

    await user.type(screen.getByLabelText('Giá trị'), 'b');
    expect(onChange).toHaveBeenCalledWith({ type: 'apiKey', key: '', value: 'b', addTo: 'header' });

    const selects = screen.getAllByRole('combobox');
    await user.click(selects[1]);
    await user.click(screen.getByRole('option', { name: 'Tham số truy vấn' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'apiKey', key: '', value: '', addTo: 'query' });
  });
});
