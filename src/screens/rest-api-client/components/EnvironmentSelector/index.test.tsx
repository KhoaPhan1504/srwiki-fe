import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import type { Environment } from '~root/types';
import { EnvironmentSelector } from '.';

const environment = (): Environment => ({
  id: 'e1',
  name: 'Dev',
  variables: [],
  createdAt: '2026-08-21T00:00:00Z',
  updatedAt: '2026-08-21T00:00:00Z',
});

describe('EnvironmentSelector', () => {
  it('shows "No Environment" selected by default', () => {
    render(
      <EnvironmentSelector
        environments={[environment()]}
        environmentId={null}
        onEnvironmentIdChange={vi.fn()}
        onManage={vi.fn()}
      />,
    );
    expect(screen.getByText('Không có Environment')).toBeInTheDocument();
  });

  it('calls onEnvironmentIdChange when a different environment is picked', async () => {
    const user = userEvent.setup();
    const onEnvironmentIdChange = vi.fn();
    render(
      <EnvironmentSelector
        environments={[environment()]}
        environmentId={null}
        onEnvironmentIdChange={onEnvironmentIdChange}
        onManage={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Dev' }));

    expect(onEnvironmentIdChange).toHaveBeenCalledWith('e1');
  });

  it('calls onManage when the gear button is clicked', async () => {
    const user = userEvent.setup();
    const onManage = vi.fn();
    render(
      <EnvironmentSelector
        environments={[]}
        environmentId={null}
        onEnvironmentIdChange={vi.fn()}
        onManage={onManage}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Quản lý Environment' }));
    expect(onManage).toHaveBeenCalledTimes(1);
  });
});
