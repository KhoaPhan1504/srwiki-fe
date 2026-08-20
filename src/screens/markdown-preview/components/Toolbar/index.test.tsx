import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from './index';
import { TOOLBAR_ACTIONS } from '~root/constants';

describe('Toolbar', () => {
  it('renders one button per toolbar action', () => {
    render(<Toolbar onAction={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(TOOLBAR_ACTIONS.length);
  });

  it('calls onAction with the clicked action', async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<Toolbar onAction={onAction} />);

    await user.click(screen.getByRole('button', { name: 'Đậm' }));

    expect(onAction).toHaveBeenCalledWith('bold');
  });
});
