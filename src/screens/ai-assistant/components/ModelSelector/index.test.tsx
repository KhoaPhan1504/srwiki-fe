import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '~root/i18n';
import type { ModelOut } from '~root/apis/useListModels';
import { ModelSelector } from '.';

const models: ModelOut[] = [
  { id: 'claude-opus-5', label: 'Claude Opus 5', provider: 'anthropic' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'gemini' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', provider: 'gemini' },
];

describe('ModelSelector', () => {
  it('renders nothing when there are no models', () => {
    const { container } = render(<ModelSelector models={[]} value={null} onChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the currently selected model label on the trigger', () => {
    render(<ModelSelector models={models} value="gemini-3.6-flash" onChange={vi.fn()} />);

    expect(screen.getByText('Gemini 3.6 Flash')).toBeInTheDocument();
  });

  it('groups models by provider and calls onChange when one is picked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<ModelSelector models={models} value="claude-opus-5" onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Gemini')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'Gemini 3.5 Flash' }));

    expect(onChange).toHaveBeenCalledWith('gemini-3.5-flash');
  });
});
