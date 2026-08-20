import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheatsheetPanel } from './index';

describe('CheatsheetPanel', () => {
  // jsdom does not apply the browser's user-agent stylesheet that hides
  // non-summary <details> children when closed, so content presence can't
  // be used to assert "collapsed" — the native `open` property is the
  // reliable signal (jsdom does correctly toggle it on a real summary click).
  it('is collapsed by default', () => {
    const { container } = render(<CheatsheetPanel />);
    expect(container.querySelector('details')?.open).toBe(false);
  });

  it('opens when the summary is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<CheatsheetPanel />);
    await user.click(screen.getByText('Xem cú pháp thường dùng'));
    expect(container.querySelector('details')?.open).toBe(true);
  });

  it('lists both syntax tokens and flags', async () => {
    const user = userEvent.setup();
    render(<CheatsheetPanel />);
    await user.click(screen.getByText('Xem cú pháp thường dùng'));

    expect(screen.getByText('\\d')).toBeInTheDocument();
    expect(screen.getByText('Global — tìm tất cả kết quả khớp')).toBeInTheDocument();
  });
});
