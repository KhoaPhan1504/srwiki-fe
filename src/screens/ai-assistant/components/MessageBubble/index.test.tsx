import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MessageBubble } from '.';

describe('MessageBubble', () => {
  it('renders content aligned right for the user', () => {
    const { container } = render(<MessageBubble align="right">Hello</MessageBubble>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('justify-end');
  });

  it('renders content aligned left for the assistant', () => {
    const { container } = render(<MessageBubble align="left">Hi there</MessageBubble>);

    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('justify-start');
  });

  it('renders assistant markdown as formatted HTML instead of raw syntax', () => {
    const { container } = render(
      <MessageBubble align="left">{'**bold** and a list:\n\n- one\n- two'}</MessageBubble>,
    );

    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(container.textContent).not.toContain('**');
  });

  it('renders user content as plain text, not parsed markdown', () => {
    const { container } = render(<MessageBubble align="right">{'**not bold**'}</MessageBubble>);

    expect(container.querySelector('strong')).toBeNull();
    expect(screen.getByText('**not bold**')).toBeInTheDocument();
  });
});
