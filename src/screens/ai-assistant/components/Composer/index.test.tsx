import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '~root/i18n';
import { Composer } from '.';

const noModelProps = { models: [], selectedModel: null, onModelChange: vi.fn() };

describe('Composer', () => {
  it('calls onChange as the user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Composer value="" onChange={onChange} onSend={vi.fn()} disabled={false} {...noModelProps} />,
    );

    await user.type(screen.getByPlaceholderText(/nhập câu hỏi/i), 'a');

    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('sends on Enter and inserts a newline on Shift+Enter', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(
      <Composer
        value="hello"
        onChange={vi.fn()}
        onSend={onSend}
        disabled={false}
        {...noModelProps}
      />,
    );
    const textarea = screen.getByPlaceholderText(/nhập câu hỏi/i);

    await user.type(textarea, '{Enter}');
    expect(onSend).toHaveBeenCalledTimes(1);

    await user.type(textarea, '{Shift>}{Enter}{/Shift}');
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('disables the send button when the input is empty or whitespace-only', () => {
    const { rerender } = render(
      <Composer value="" onChange={vi.fn()} onSend={vi.fn()} disabled={false} {...noModelProps} />,
    );
    expect(screen.getByRole('button', { name: /gửi/i })).toBeDisabled();

    rerender(
      <Composer
        value="   "
        onChange={vi.fn()}
        onSend={vi.fn()}
        disabled={false}
        {...noModelProps}
      />,
    );
    expect(screen.getByRole('button', { name: /gửi/i })).toBeDisabled();

    rerender(
      <Composer
        value="hi"
        onChange={vi.fn()}
        onSend={vi.fn()}
        disabled={false}
        {...noModelProps}
      />,
    );
    expect(screen.getByRole('button', { name: /gửi/i })).toBeEnabled();
  });

  it('disables the send button while a request is in flight', () => {
    render(<Composer value="hi" onChange={vi.fn()} onSend={vi.fn()} disabled {...noModelProps} />);
    expect(screen.getByRole('button', { name: /gửi/i })).toBeDisabled();
  });

  it('renders the model selector when models are available', () => {
    render(
      <Composer
        value="hi"
        onChange={vi.fn()}
        onSend={vi.fn()}
        disabled={false}
        models={[{ id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', provider: 'gemini' }]}
        selectedModel="gemini-3.6-flash"
        onModelChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Gemini 3.6 Flash')).toBeInTheDocument();
  });
});
