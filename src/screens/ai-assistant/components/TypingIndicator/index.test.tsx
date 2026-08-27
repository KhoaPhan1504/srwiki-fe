import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TypingIndicator } from '.';

describe('TypingIndicator', () => {
  it('renders three bouncing dots', () => {
    render(<TypingIndicator />);

    const dots = screen.getByTestId('typing-indicator').children;
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveClass('animate-bounce');
  });
});
