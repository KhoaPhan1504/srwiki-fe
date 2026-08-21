import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Environment, KeyValuePair } from '~root/types';
import { EnvironmentManagerDialog } from '.';

const environment = (overrides: Partial<Environment> = {}): Environment => ({
  id: 'e1',
  name: 'Dev',
  variables: [{ id: 'v1', key: 'base_url', value: 'https://dev.api', enabled: true }],
  createdAt: '2026-08-21T00:00:00Z',
  updatedAt: '2026-08-21T00:00:00Z',
  ...overrides,
});

const baseProps = {
  open: true,
  onOpenChange: vi.fn(),
  environments: [] as Environment[],
  globalVariables: [] as KeyValuePair[],
  onCreateEnvironment: vi.fn(),
  onRenameEnvironment: vi.fn(),
  onDeleteEnvironment: vi.fn(),
  onSaveEnvironmentVariables: vi.fn(),
  onSaveGlobalVariables: vi.fn(),
};

describe('EnvironmentManagerDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the Globals tab by default and saves edited global variables', async () => {
    const user = userEvent.setup();
    const onSaveGlobalVariables = vi.fn();
    render(
      <EnvironmentManagerDialog
        {...baseProps}
        globalVariables={[{ id: 'g1', key: 'token', value: 'old', enabled: true }]}
        onSaveGlobalVariables={onSaveGlobalVariables}
      />,
    );

    const valueInput = screen.getByDisplayValue('old');
    await user.clear(valueInput);
    await user.type(valueInput, 'new');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSaveGlobalVariables).toHaveBeenCalledWith([
      { id: 'g1', key: 'token', value: 'new', enabled: true },
    ]);
  });

  it('switches to the Environments tab, selects one, and saves its variables', async () => {
    const user = userEvent.setup();
    const onSaveEnvironmentVariables = vi.fn();
    render(
      <EnvironmentManagerDialog
        {...baseProps}
        environments={[environment()]}
        onSaveEnvironmentVariables={onSaveEnvironmentVariables}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Environments' }));
    await user.click(screen.getByRole('button', { name: 'Dev' }));

    const valueInput = screen.getByDisplayValue('https://dev.api');
    await user.clear(valueInput);
    await user.type(valueInput, 'https://staging.api');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onSaveEnvironmentVariables).toHaveBeenCalledWith('e1', [
      { id: 'v1', key: 'base_url', value: 'https://staging.api', enabled: true },
    ]);
  });

  it('creates a new environment via the manager', async () => {
    const user = userEvent.setup();
    const onCreateEnvironment = vi.fn();
    render(<EnvironmentManagerDialog {...baseProps} onCreateEnvironment={onCreateEnvironment} />);

    await user.click(screen.getByRole('tab', { name: 'Environments' }));
    await user.click(screen.getByRole('button', { name: 'Environment mới' }));
    await user.type(screen.getByLabelText('Tên'), 'Staging');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(onCreateEnvironment).toHaveBeenCalledWith('Staging');
  });

  it('renames and deletes an environment via its menu', async () => {
    const user = userEvent.setup();
    const onRenameEnvironment = vi.fn();
    const onDeleteEnvironment = vi.fn();
    render(
      <EnvironmentManagerDialog
        {...baseProps}
        environments={[environment()]}
        onRenameEnvironment={onRenameEnvironment}
        onDeleteEnvironment={onDeleteEnvironment}
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Environments' }));
    const row = screen.getByText('Dev').closest('div')!;
    await user.click(within(row).getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Đổi tên' }));
    await user.clear(screen.getByLabelText('Tên'));
    await user.type(screen.getByLabelText('Tên'), 'Renamed');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(onRenameEnvironment).toHaveBeenCalledWith('e1', 'Renamed');

    await user.click(within(row).getByRole('button', { name: /menu/i }));
    await user.click(screen.getByRole('menuitem', { name: 'Xoá' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Xoá' }));
    expect(onDeleteEnvironment).toHaveBeenCalledWith('e1');
  });
});
