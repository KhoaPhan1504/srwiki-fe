import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { ConfigPanel } from '.';
import { ValidationReason, UUIDCase, UUIDVersion } from '~root/constants';

const validQuantity = { valid: true as const, value: 5 };
const invalidQuantity = {
  valid: false as const,
  reason: ValidationReason.TOO_LARGE as const,
};

const renderPanel = (overrides: Partial<React.ComponentProps<typeof ConfigPanel>> = {}) => {
  const props = {
    version: UUIDVersion.V4 as const,
    onVersionChange: vi.fn(),
    quantity: '5',
    onQuantityChange: vi.fn(),
    quantityValidation: validQuantity,
    caseOption: UUIDCase.LOWER as const,
    onCaseChange: vi.fn(),
    removeHyphens: false,
    onRemoveHyphensChange: vi.fn(),
    onGenerate: vi.fn(),
    ...overrides,
  };
  render(<ConfigPanel {...props} />);
  return props;
};

describe('ConfigPanel', () => {
  it('shows the panel title', () => {
    renderPanel();
    expect(screen.getByText('Cấu hình')).toBeInTheDocument();
  });

  it('shows the v4 description by default', () => {
    renderPanel();
    expect(
      screen.getByText('UUID ngẫu nhiên, phù hợp làm định danh cho mục đích chung.'),
    ).toBeInTheDocument();
  });

  it('shows the v7 description when version is v7', () => {
    renderPanel({ version: UUIDVersion.V7 });
    expect(
      screen.getByText(
        'UUID có thứ tự theo thời gian, phù hợp cho chỉ mục cơ sở dữ liệu và định danh có thể sắp xếp.',
      ),
    ).toBeInTheDocument();
  });

  it('calls onQuantityChange as the user types', async () => {
    const user = userEvent.setup();
    const { onQuantityChange } = renderPanel({ quantity: '' });
    await user.type(screen.getByLabelText('Số lượng'), '9');
    expect(onQuantityChange).toHaveBeenCalledWith('9');
  });

  it('shows a validation error and disables Generate when the quantity is invalid', () => {
    renderPanel({ quantity: '999', quantityValidation: invalidQuantity });
    expect(screen.getByRole('alert')).toHaveTextContent('Số lượng tối đa là 100.');
    expect(screen.getByRole('button', { name: 'Generate UUIDs' })).toBeDisabled();
  });

  it('enables Generate and calls onGenerate when the quantity is valid', async () => {
    const user = userEvent.setup();
    const { onGenerate } = renderPanel();
    const button = screen.getByRole('button', { name: 'Generate UUIDs' });
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it('calls onCaseChange when Uppercase is selected', async () => {
    const user = userEvent.setup();
    const { onCaseChange } = renderPanel();
    await user.click(screen.getByRole('radio', { name: 'Chữ hoa' }));
    expect(onCaseChange).toHaveBeenCalledWith('upper');
  });

  it('calls onRemoveHyphensChange when the checkbox is toggled', async () => {
    const user = userEvent.setup();
    const { onRemoveHyphensChange } = renderPanel();
    await user.click(screen.getByRole('checkbox', { name: 'Bỏ dấu gạch nối' }));
    expect(onRemoveHyphensChange).toHaveBeenCalledWith(true);
  });
});
