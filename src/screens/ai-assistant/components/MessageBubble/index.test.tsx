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
});
