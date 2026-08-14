import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSheet } from './index';
import { EMPTY_FILTERS } from '../../types';
import { MembershipTier } from '~root/constants';

describe('FilterSheet', () => {
  it('is not in the document when closed', () => {
    render(
      <FilterSheet
        open={false}
        onOpenChange={vi.fn()}
        appliedFilters={EMPTY_FILTERS}
        onApply={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.queryByText('Bộ lọc')).not.toBeInTheDocument();
  });

  it('renders its content when open', () => {
    render(
      <FilterSheet
        open
        onOpenChange={vi.fn()}
        appliedFilters={EMPTY_FILTERS}
        onApply={vi.fn()}
        onClearAll={vi.fn()}
      />,
    );
    expect(screen.getAllByText('Bộ lọc').length).toBeGreaterThan(0);
  });

  it('toggling a checkbox and clicking Apply calls onApply with the selected tier, then closes', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <FilterSheet
        open
        onOpenChange={onOpenChange}
        appliedFilters={EMPTY_FILTERS}
        onApply={onApply}
        onClearAll={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'VIP' }));
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ membershipTier: [MembershipTier.VIP] }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('clicking Clear All calls onClearAll and closes without calling onApply', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    const onClearAll = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <FilterSheet
        open
        onOpenChange={onOpenChange}
        appliedFilters={{ ...EMPTY_FILTERS, address: 'Ha Noi' }}
        onApply={onApply}
        onClearAll={onClearAll}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Xoá tất cả' }));

    expect(onClearAll).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onApply).not.toHaveBeenCalled();
  });
});
