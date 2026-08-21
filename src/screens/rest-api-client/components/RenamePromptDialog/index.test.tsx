import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { RenamePromptDialog } from '.';

describe('RenamePromptDialog', () => {
  it('prefills the input with initialValue', () => {
    render(
      <RenamePromptDialog
        open
        onOpenChange={vi.fn()}
        title="Đổi tên collection"
        initialValue="My Collection"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Tên')).toHaveValue('My Collection');
  });

  it('calls onSubmit with the edited value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <RenamePromptDialog
        open
        onOpenChange={vi.fn()}
        title="Đổi tên collection"
        initialValue="My Collection"
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByLabelText('Tên');
    await user.clear(input);
    await user.type(input, 'Renamed');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSubmit).toHaveBeenCalledWith('Renamed');
  });

  it('resets the input to the new initialValue when reopened for a different item', () => {
    const { rerender } = render(
      <RenamePromptDialog
        open
        onOpenChange={vi.fn()}
        title="Đổi tên"
        initialValue="First"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Tên')).toHaveValue('First');

    rerender(
      <RenamePromptDialog
        open
        onOpenChange={vi.fn()}
        title="Đổi tên"
        initialValue="Second"
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Tên')).toHaveValue('Second');
  });
});
