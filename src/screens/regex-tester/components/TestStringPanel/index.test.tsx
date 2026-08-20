import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestStringPanel } from './index';
import { TEST_STRING_WARN_LENGTH } from '~root/constants';

describe('TestStringPanel', () => {
  it('shows the character count', () => {
    render(<TestStringPanel value="hello" onChange={vi.fn()} />);
    expect(screen.getByText('5 ký tự')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<TestStringPanel value="" onChange={onChange} />);
    await user.type(screen.getByLabelText('Chuỗi kiểm tra'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows a warning when the value exceeds TEST_STRING_WARN_LENGTH', () => {
    render(<TestStringPanel value={'a'.repeat(TEST_STRING_WARN_LENGTH + 1)} onChange={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows no warning below the threshold', () => {
    render(<TestStringPanel value="short" onChange={vi.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
