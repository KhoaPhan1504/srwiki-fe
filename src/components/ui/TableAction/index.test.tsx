import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import '~root/i18n';
import { TableAction, type TableActionItem } from './index';

describe('TableAction', () => {
  it('shows only the trigger button until clicked', () => {
    const items: TableActionItem[] = [{ key: 'view', label: 'View', icon: Eye, onSelect: vi.fn() }];
    render(<TableAction items={items} triggerLabel="Actions" />);
    expect(screen.getByLabelText('Actions')).toBeInTheDocument();
    expect(screen.queryByText('View')).not.toBeInTheDocument();
  });

  it('calls onSelect immediately for an item without confirm', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items: TableActionItem[] = [{ key: 'view', label: 'View', icon: Eye, onSelect }];
    render(<TableAction items={items} triggerLabel="Actions" />);

    await user.click(screen.getByLabelText('Actions'));
    await user.click(screen.getByText('View'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('does not call a disabled item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items: TableActionItem[] = [
      { key: 'delete', label: 'Delete', icon: Trash2, onSelect, disabled: true },
    ];
    render(<TableAction items={items} triggerLabel="Actions" />);

    await user.click(screen.getByLabelText('Actions'));
    await user.click(screen.getByText('Delete'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('opens a confirm dialog for an item with confirm, and only calls onSelect on confirm', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items: TableActionItem[] = [
      {
        key: 'delete',
        label: 'Delete',
        icon: Trash2,
        onSelect,
        variant: 'destructive',
        confirm: {
          title: 'Delete this row?',
          description: 'This cannot be undone.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
        },
      },
    ];
    render(<TableAction items={items} triggerLabel="Actions" />);

    await user.click(screen.getByLabelText('Actions'));
    await user.click(screen.getByText('Delete'));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this row?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete this row?')).not.toBeInTheDocument();
  });

  it('calls onSelect after confirming a confirm-required item', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const items: TableActionItem[] = [
      {
        key: 'delete',
        label: 'Delete',
        icon: Trash2,
        onSelect,
        confirm: {
          title: 'Delete this row?',
          description: 'This cannot be undone.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
        },
      },
    ];
    render(<TableAction items={items} triggerLabel="Actions" />);

    await user.click(screen.getByLabelText('Actions'));
    await user.click(screen.getByText('Delete'));
    const confirmButtons = screen.getAllByText('Delete');
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(onSelect).toHaveBeenCalled();
  });

  it('renders every item label when open', async () => {
    const user = userEvent.setup();
    const items: TableActionItem[] = [
      { key: 'view', label: 'View', icon: Eye, onSelect: vi.fn() },
      { key: 'edit', label: 'Edit', icon: Pencil, onSelect: vi.fn() },
    ];
    render(<TableAction items={items} triggerLabel="Actions" />);

    await user.click(screen.getByLabelText('Actions'));

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
