import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BodyEditor } from '.';

const baseProps = {
  value: '',
  onChange: vi.fn(),
};

describe('BodyEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the placeholder and shows no validity badge when empty', () => {
    render(<BodyEditor {...baseProps} />);
    expect(screen.queryByText('JSON hợp lệ')).not.toBeInTheDocument();
    expect(screen.queryByText('JSON không hợp lệ')).not.toBeInTheDocument();
  });

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<BodyEditor {...baseProps} onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('shows a valid-JSON badge for well-formed JSON', () => {
    render(<BodyEditor {...baseProps} value={'{"a":1}'} />);
    expect(screen.getByText('JSON hợp lệ')).toBeInTheDocument();
  });

  it('shows an invalid-JSON badge for malformed JSON without blocking anything', () => {
    render(<BodyEditor {...baseProps} value="{not json" />);
    expect(screen.getByText('JSON không hợp lệ')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeEnabled();
  });

  it('shows no badge for whitespace-only content', () => {
    render(<BodyEditor {...baseProps} value="   " />);
    expect(screen.queryByText('JSON hợp lệ')).not.toBeInTheDocument();
    expect(screen.queryByText('JSON không hợp lệ')).not.toBeInTheDocument();
  });

  it('shows the GET hint and disables the textarea instead of a validity badge when disabled', () => {
    render(<BodyEditor {...baseProps} value={'{"a":1}'} disabled />);
    expect(screen.getByText('Yêu cầu GET không thể có nội dung.')).toBeInTheDocument();
    expect(screen.queryByText('JSON hợp lệ')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
