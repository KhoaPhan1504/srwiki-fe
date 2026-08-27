import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '~root/i18n';
import type { AiMessage } from '~root/ai-tools/client';
import { MessageList } from '.';

const userMessage: AiMessage = { role: 'user', content: 'Xin chào' };

describe('MessageList', () => {
  it('shows the empty state when there are no messages', () => {
    render(<MessageList messages={[]} />);

    expect(screen.getByText('Bắt đầu trò chuyện')).toBeInTheDocument();
    expect(screen.queryByText('Xin chào')).not.toBeInTheDocument();
  });

  it('renders messages without a typing indicator by default', () => {
    render(<MessageList messages={[userMessage]} />);

    expect(screen.getByText('Xin chào')).toBeInTheDocument();
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('shows the typing indicator while a reply is loading', () => {
    render(<MessageList messages={[userMessage]} isLoading />);

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });
});
