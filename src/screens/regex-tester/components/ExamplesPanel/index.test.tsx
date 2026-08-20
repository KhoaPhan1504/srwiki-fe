import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExamplesPanel } from './index';
import { EXAMPLE_PATTERNS } from '~root/constants';

describe('ExamplesPanel', () => {
  it('does not call onSelectExample before the user picks anything', () => {
    const onSelectExample = vi.fn();
    render(<ExamplesPanel onSelectExample={onSelectExample} />);
    expect(onSelectExample).not.toHaveBeenCalled();
  });

  it('calls onSelectExample with the matching example when one is chosen', async () => {
    const onSelectExample = vi.fn();
    const user = userEvent.setup();
    render(<ExamplesPanel onSelectExample={onSelectExample} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Email' }));

    expect(onSelectExample).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'email', pattern: EXAMPLE_PATTERNS[0].pattern }),
    );
  });
});
