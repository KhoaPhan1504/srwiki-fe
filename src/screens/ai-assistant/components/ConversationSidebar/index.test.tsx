import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '~root/i18n';

const { useListConversationsMock, deleteMutateMock } = vi.hoisted(() => ({
  useListConversationsMock: vi.fn(),
  deleteMutateMock: vi.fn(),
}));

vi.mock('~root/apis/useListConversations', () => ({
  useListConversations: useListConversationsMock,
}));

vi.mock('~root/apis/useDeleteConversation', () => ({
  useDeleteConversation: () => ({ mutate: deleteMutateMock }),
}));

import { ConversationSidebar } from '.';

describe('ConversationSidebar', () => {
  afterEach(() => {
    useListConversationsMock.mockReset();
    deleteMutateMock.mockReset();
  });

  it('renders the conversation list', () => {
    useListConversationsMock.mockReturnValue({
      conversations: [{ id: 'conv-1', title: 'My chat', createdAt: '', updatedAt: '' }],
      isLoading: false,
    });

    render(
      <ConversationSidebar activeConversationId={null} onSelect={vi.fn()} onNewChat={vi.fn()} />,
    );

    expect(screen.getByText('My chat')).toBeInTheDocument();
  });

  it('collapses to an icon-only rail and expands back on toggle click', async () => {
    useListConversationsMock.mockReturnValue({ conversations: [], isLoading: false });
    const user = userEvent.setup();

    render(
      <ConversationSidebar activeConversationId={null} onSelect={vi.fn()} onNewChat={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /thu gọn/i }));
    expect(screen.queryByRole('button', { name: /chat mới/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mở rộng/i }));
    expect(screen.getByRole('button', { name: /chat mới/i })).toBeInTheDocument();
  });

  it('returns to new chat when deleting the active conversation', async () => {
    useListConversationsMock.mockReturnValue({
      conversations: [{ id: 'conv-1', title: 'My chat', createdAt: '', updatedAt: '' }],
      isLoading: false,
    });
    deleteMutateMock.mockImplementation((_id, options) => options?.onSuccess?.());
    const onNewChat = vi.fn();
    const user = userEvent.setup();

    render(
      <ConversationSidebar
        activeConversationId="conv-1"
        onSelect={vi.fn()}
        onNewChat={onNewChat}
      />,
    );

    await user.click(screen.getByRole('button', { name: /xoá cuộc trò chuyện/i }));

    expect(deleteMutateMock).toHaveBeenCalledWith('conv-1', expect.any(Object));
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('starts collapsed on narrow viewports so the composer keeps its width', () => {
    useListConversationsMock.mockReturnValue({ conversations: [], isLoading: false });
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });

    render(
      <ConversationSidebar activeConversationId={null} onSelect={vi.fn()} onNewChat={vi.fn()} />,
    );

    expect(screen.queryByRole('button', { name: /chat mới/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mở rộng/i })).toBeInTheDocument();

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth,
    });
  });

  it('does not start a new chat when deleting a non-active conversation', async () => {
    useListConversationsMock.mockReturnValue({
      conversations: [{ id: 'conv-1', title: 'My chat', createdAt: '', updatedAt: '' }],
      isLoading: false,
    });
    deleteMutateMock.mockImplementation((_id, options) => options?.onSuccess?.());
    const onNewChat = vi.fn();
    const user = userEvent.setup();

    render(
      <ConversationSidebar
        activeConversationId="conv-2"
        onSelect={vi.fn()}
        onNewChat={onNewChat}
      />,
    );

    await user.click(screen.getByRole('button', { name: /xoá cuộc trò chuyện/i }));

    expect(onNewChat).not.toHaveBeenCalled();
  });
});
