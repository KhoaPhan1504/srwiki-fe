import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToolCallChip } from '.';

describe('ToolCallChip', () => {
  it('shows a pending indicator while there is no result yet', () => {
    render(<ToolCallChip toolName="decode_jwt" toolInput={{ token: 'abc' }} />);

    expect(screen.getByText('decode_jwt({"token":"abc"})')).toBeInTheDocument();
    expect(screen.getByTestId('tool-call-pending')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-call-done')).not.toBeInTheDocument();
  });

  it('shows a done indicator once a result is present', () => {
    render(
      <ToolCallChip
        toolName="decode_jwt"
        toolInput={{ token: 'abc' }}
        result={{ success: true, data: {} }}
      />,
    );

    expect(screen.getByTestId('tool-call-done')).toBeInTheDocument();
    expect(screen.queryByTestId('tool-call-pending')).not.toBeInTheDocument();
  });
});
