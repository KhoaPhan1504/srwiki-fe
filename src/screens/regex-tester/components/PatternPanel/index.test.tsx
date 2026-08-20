import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatternPanel } from './index';

describe('PatternPanel', () => {
  it('renders the current pattern and flags preview', () => {
    render(
      <PatternPanel
        pattern="a+"
        onPatternChange={vi.fn()}
        flags="gi"
        onToggleFlag={vi.fn()}
        syntaxError={null}
      />,
    );
    expect(screen.getByText('/a+/gi')).toBeInTheDocument();
  });

  it('calls onPatternChange when the pattern input changes', async () => {
    const onPatternChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PatternPanel
        pattern=""
        onPatternChange={onPatternChange}
        flags="g"
        onToggleFlag={vi.fn()}
        syntaxError={null}
      />,
    );
    await user.type(screen.getByLabelText('Pattern'), 'a');
    expect(onPatternChange).toHaveBeenCalled();
  });

  it('calls onToggleFlag when a flag checkbox is clicked', async () => {
    const onToggleFlag = vi.fn();
    const user = userEvent.setup();
    render(
      <PatternPanel
        pattern="a"
        onPatternChange={vi.fn()}
        flags="g"
        onToggleFlag={onToggleFlag}
        syntaxError={null}
      />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'i' }));
    expect(onToggleFlag).toHaveBeenCalledWith('i');
  });

  it('shows the syntax error when provided', () => {
    render(
      <PatternPanel
        pattern="(a"
        onPatternChange={vi.fn()}
        flags="g"
        onToggleFlag={vi.fn()}
        syntaxError={{ message: 'Unterminated group' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unterminated group');
  });

  it('shows no error block when syntaxError is null', () => {
    render(
      <PatternPanel
        pattern="a"
        onPatternChange={vi.fn()}
        flags="g"
        onToggleFlag={vi.fn()}
        syntaxError={null}
      />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
