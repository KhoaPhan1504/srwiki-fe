import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyValuePair } from '~root/types';
import { RequestPanel } from '.';

const row = (): KeyValuePair => ({ id: 'row-1', key: '', value: '', enabled: true });

const baseProps = {
  method: 'POST' as const,
  queryParams: [] as KeyValuePair[],
  onAddQueryParam: vi.fn(),
  onUpdateQueryParam: vi.fn(),
  onRemoveQueryParam: vi.fn(),
  headers: [] as KeyValuePair[],
  onAddHeader: vi.fn(),
  onUpdateHeader: vi.fn(),
  onRemoveHeader: vi.fn(),
  body: '',
  onBodyChange: vi.fn(),
  bodyType: 'raw' as const,
  onBodyTypeChange: vi.fn(),
  bodyFields: [] as KeyValuePair[],
  onAddBodyField: vi.fn(),
  onUpdateBodyField: vi.fn(),
  onRemoveBodyField: vi.fn(),
  auth: { type: 'none' } as const,
  onAuthChange: vi.fn(),
};

describe('RequestPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the Params tab by default', () => {
    render(<RequestPanel {...baseProps} />);
    expect(screen.getByText('Chưa có tham số nào.')).toBeInTheDocument();
  });

  it('switches to the Authorization tab and shows the auth type selector', async () => {
    const user = userEvent.setup();
    render(<RequestPanel {...baseProps} />);

    await user.click(screen.getByRole('tab', { name: 'Xác thực' }));
    expect(screen.getByText('Yêu cầu này sẽ không gửi thông tin xác thực.')).toBeInTheDocument();
  });

  it('forwards auth changes from the Authorization tab', async () => {
    const user = userEvent.setup();
    const onAuthChange = vi.fn();
    render(<RequestPanel {...baseProps} onAuthChange={onAuthChange} />);

    await user.click(screen.getByRole('tab', { name: 'Xác thực' }));
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Bearer Token' }));

    expect(onAuthChange).toHaveBeenCalledWith({ type: 'bearer', token: '' });
  });

  it('switches to the Headers tab and shows header rows', async () => {
    const user = userEvent.setup();
    render(<RequestPanel {...baseProps} headers={[row()]} />);

    await user.click(screen.getByRole('tab', { name: 'Header' }));
    expect(screen.getByPlaceholderText('Tên header')).toBeInTheDocument();
  });

  it('switches to the Body tab and shows the body editor', async () => {
    const user = userEvent.setup();
    render(<RequestPanel {...baseProps} />);

    await user.click(screen.getByRole('tab', { name: 'Nội dung' }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('forwards body type changes from the Body tab', async () => {
    const user = userEvent.setup();
    const onBodyTypeChange = vi.fn();
    render(<RequestPanel {...baseProps} onBodyTypeChange={onBodyTypeChange} />);

    await user.click(screen.getByRole('tab', { name: 'Nội dung' }));
    await user.click(screen.getByRole('radio', { name: 'Form Data' }));

    expect(onBodyTypeChange).toHaveBeenCalledWith('formData');
  });

  it('disables the Body tab for GET requests', () => {
    render(<RequestPanel {...baseProps} method="GET" />);
    expect(screen.getByRole('tab', { name: 'Nội dung' })).toBeDisabled();
  });

  it('enables the Body tab for methods that take a body', () => {
    render(<RequestPanel {...baseProps} method="POST" />);
    expect(screen.getByRole('tab', { name: 'Nội dung' })).toBeEnabled();
  });

  it('forwards add/update calls from the Params tab', async () => {
    const user = userEvent.setup();
    const onAddQueryParam = vi.fn();
    render(<RequestPanel {...baseProps} onAddQueryParam={onAddQueryParam} />);

    await user.click(screen.getByRole('button', { name: 'Thêm tham số' }));
    expect(onAddQueryParam).toHaveBeenCalledTimes(1);
  });
});
