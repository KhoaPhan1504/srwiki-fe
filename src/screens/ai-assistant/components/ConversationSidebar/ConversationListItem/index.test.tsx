import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import '~root/i18n';
import { ConversationListItem } from '.';

const CONVERSATION = { id: 'conv-1', title: 'My chat', createdAt: '', updatedAt: '' };

describe('ConversationListItem', () => {
  it('calls onSelect when the row is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ConversationListItem
        conversation={CONVERSATION}
        active={false}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText('My chat'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete without triggering onSelect when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    render(
      <ConversationListItem
        conversation={CONVERSATION}
        active={false}
        onSelect={onSelect}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: /xoá/i }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
