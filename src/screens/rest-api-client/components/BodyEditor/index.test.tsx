import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyValuePair } from '~root/types';
import { BodyEditor } from '.';

const row = (overrides: Partial<KeyValuePair> = {}): KeyValuePair => ({
  id: 'row-1',
  key: '',
  value: '',
  enabled: true,
  ...overrides,
});

const baseProps = {
  value: '',
  onChange: vi.fn(),
  bodyType: 'raw' as const,
  onBodyTypeChange: vi.fn(),
  bodyFields: [] as KeyValuePair[],
  onAddBodyField: vi.fn(),
  onUpdateBodyField: vi.fn(),
  onRemoveBodyField: vi.fn(),
};

describe('BodyEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the placeholder and shows no validity badge when empty', () => {
    render(<BodyEditor {...baseProps} />);
    expect(screen.queryByText('JSON hợp lệ')).not.toBeInTheDocument();
    expect(screen.queryByText('JSON không hợp lệ')).not.toBeInTheDocument();
  });

  it('calls onChange as the user types in raw mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BodyEditor {...baseProps} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows a valid-JSON badge for well-formed JSON', () => {
    render(<BodyEditor {...baseProps} value={'{"a":1}'} />);
    expect(screen.getByText('JSON hợp lệ')).toBeInTheDocument();
  });

  it('shows an invalid-JSON badge for malformed JSON', () => {
    render(<BodyEditor {...baseProps} value="{not json" />);
    expect(screen.getByText('JSON không hợp lệ')).toBeInTheDocument();
  });

  it('shows the GET hint and disables the textarea instead of a validity badge when disabled', () => {
    render(<BodyEditor {...baseProps} value={'{"a":1}'} disabled />);
    expect(screen.getByText('Yêu cầu GET không thể có nội dung.')).toBeInTheDocument();
    expect(screen.queryByText('JSON hợp lệ')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('switches to Form Data and calls onBodyTypeChange', async () => {
    const user = userEvent.setup();
    const onBodyTypeChange = vi.fn();
    render(<BodyEditor {...baseProps} onBodyTypeChange={onBodyTypeChange} />);

    await user.click(screen.getByRole('radio', { name: 'Form Data' }));
    expect(onBodyTypeChange).toHaveBeenCalledWith('formData');
  });

  it('shows key/value rows instead of the JSON textarea for x-www-form-urlencoded', () => {
    render(<BodyEditor {...baseProps} bodyType="urlEncoded" bodyFields={[row()]} />);

    expect(screen.queryByPlaceholderText('{\n  "key": "value"\n}')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tên')).toBeInTheDocument();
  });

  it('forwards add/update/remove calls from the field editor', async () => {
    const user = userEvent.setup();
    const onAddBodyField = vi.fn();
    const onUpdateBodyField = vi.fn();
    render(
      <BodyEditor
        {...baseProps}
        bodyType="formData"
        bodyFields={[row()]}
        onAddBodyField={onAddBodyField}
        onUpdateBodyField={onUpdateBodyField}
      />,
    );

    await user.type(screen.getByPlaceholderText('Tên'), 'a');
    expect(onUpdateBodyField).toHaveBeenCalledWith('row-1', { key: 'a' });

    await user.click(screen.getByRole('button', { name: 'Thêm trường' }));
    expect(onAddBodyField).toHaveBeenCalledTimes(1);
  });

  it('disables the body type selector when disabled', () => {
    render(<BodyEditor {...baseProps} disabled />);
    expect(screen.getByRole('radio', { name: 'Form Data' })).toBeDisabled();
  });
});
