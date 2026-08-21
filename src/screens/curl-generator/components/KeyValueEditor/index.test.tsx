import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { KeyValuePair } from '~root/types';
import { KeyValueEditor } from '.';

const row = (overrides: Partial<KeyValuePair> = {}): KeyValuePair => ({
  id: 'row-1',
  key: '',
  value: '',
  enabled: true,
  ...overrides,
});

const baseProps = {
  rows: [] as KeyValuePair[],
  onAdd: vi.fn(),
  onUpdate: vi.fn(),
  onRemove: vi.fn(),
  keyPlaceholder: 'Key',
  valuePlaceholder: 'Value',
  addLabel: 'Add row',
  removeLabel: 'Remove row',
  enabledLabel: 'Enable this row',
  emptyLabel: 'No rows yet.',
};

describe('KeyValueEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the empty label when there are no rows', () => {
    render(<KeyValueEditor {...baseProps} />);
    expect(screen.getByText('No rows yet.')).toBeInTheDocument();
  });

  it('renders a row with key/value inputs and calls onUpdate as the user types', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<KeyValueEditor {...baseProps} rows={[row()]} onUpdate={onUpdate} />);

    await user.type(screen.getByPlaceholderText('Key'), 'a');
    expect(onUpdate).toHaveBeenCalledWith('row-1', { key: 'a' });

    await user.type(screen.getByPlaceholderText('Value'), 'b');
    expect(onUpdate).toHaveBeenCalledWith('row-1', { value: 'b' });
  });

  it('calls onUpdate to toggle the enabled checkbox', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(<KeyValueEditor {...baseProps} rows={[row({ enabled: true })]} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('checkbox', { name: 'Enable this row' }));
    expect(onUpdate).toHaveBeenCalledWith('row-1', { enabled: false });
  });

  it('calls onRemove for the row when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<KeyValueEditor {...baseProps} rows={[row()]} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove row' }));
    expect(onRemove).toHaveBeenCalledWith('row-1');
  });

  it('calls onAdd when the add-row button is clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<KeyValueEditor {...baseProps} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'Add row' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('renders multiple rows independently, each keyed by its own id', () => {
    render(
      <KeyValueEditor
        {...baseProps}
        rows={[row({ id: 'row-1', key: 'a' }), row({ id: 'row-2', key: 'b' })]}
      />,
    );
    expect(screen.getAllByPlaceholderText('Key')).toHaveLength(2);
    expect(screen.getByDisplayValue('a')).toBeInTheDocument();
    expect(screen.getByDisplayValue('b')).toBeInTheDocument();
  });

  it('does not show the empty label when at least one row exists', () => {
    render(<KeyValueEditor {...baseProps} rows={[row()]} />);
    expect(screen.queryByText('No rows yet.')).not.toBeInTheDocument();
  });
});
