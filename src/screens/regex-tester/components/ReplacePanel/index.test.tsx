import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplacePanel } from './index';

describe('ReplacePanel', () => {
  it('shows the preview result', () => {
    render(
      <ReplacePanel
        replacement="fox"
        onReplacementChange={vi.fn()}
        replacePreview="fox dog fox"
        hasSyntaxError={false}
        testStringEmpty={false}
        onReplaceAll={vi.fn()}
      />,
    );
    expect(screen.getByText('fox dog fox')).toBeInTheDocument();
  });

  it('calls onReplacementChange when typing', async () => {
    const onReplacementChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ReplacePanel
        replacement=""
        onReplacementChange={onReplacementChange}
        replacePreview=""
        hasSyntaxError={false}
        testStringEmpty={false}
        onReplaceAll={vi.fn()}
      />,
    );
    await user.type(screen.getByLabelText('Chuỗi thay thế'), 'x');
    expect(onReplacementChange).toHaveBeenCalled();
  });

  it('calls onReplaceAll when Replace All is clicked', async () => {
    const onReplaceAll = vi.fn();
    const user = userEvent.setup();
    render(
      <ReplacePanel
        replacement="fox"
        onReplacementChange={vi.fn()}
        replacePreview="fox dog fox"
        hasSyntaxError={false}
        testStringEmpty={false}
        onReplaceAll={onReplaceAll}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Replace All' }));
    expect(onReplaceAll).toHaveBeenCalled();
  });

  it('disables Replace All when there is a syntax error', () => {
    render(
      <ReplacePanel
        replacement="fox"
        onReplacementChange={vi.fn()}
        replacePreview=""
        hasSyntaxError
        testStringEmpty={false}
        onReplaceAll={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Replace All' })).toBeDisabled();
  });

  it('disables Replace All when the test string is empty', () => {
    render(
      <ReplacePanel
        replacement="fox"
        onReplacementChange={vi.fn()}
        replacePreview=""
        hasSyntaxError={false}
        testStringEmpty
        onReplaceAll={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Replace All' })).toBeDisabled();
  });
});
