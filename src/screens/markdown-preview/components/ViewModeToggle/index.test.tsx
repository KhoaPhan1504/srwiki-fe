import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewModeToggle } from './index';

describe('ViewModeToggle', () => {
  it('marks the active view mode as pressed', () => {
    render(<ViewModeToggle value="split" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Chia đôi' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Soạn thảo' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onChange with the clicked mode', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewModeToggle value="split" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Xem trước' }));

    expect(onChange).toHaveBeenCalledWith('preview');
  });
});
