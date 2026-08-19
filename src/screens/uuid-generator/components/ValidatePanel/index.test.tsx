import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { ValidatePanel } from '.';

describe('ValidatePanel', () => {
  it('shows no status when the input is empty', () => {
    render(<ValidatePanel />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports a valid v4 UUID with its version and variant', async () => {
    const user = userEvent.setup();
    render(<ValidatePanel />);

    await user.type(
      screen.getByLabelText('UUID cần kiểm tra'),
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('UUID hợp lệ')).toBeInTheDocument();
    expect(screen.getByText('Phiên bản: 4')).toBeInTheDocument();
    expect(screen.getByText('Variant: RFC 9562')).toBeInTheDocument();
  });

  it('reports a timestamp for a valid v7 UUID', async () => {
    const user = userEvent.setup();
    render(<ValidatePanel />);

    await user.type(
      screen.getByLabelText('UUID cần kiểm tra'),
      '017f22e2-79b0-7cc3-98c4-dc0c0c07398f',
    );

    expect(screen.getByText('Phiên bản: 7')).toBeInTheDocument();
    expect(screen.getByText(/^Timestamp: /)).toBeInTheDocument();
  });

  it('does not show a timestamp for a valid v4 UUID', async () => {
    const user = userEvent.setup();
    render(<ValidatePanel />);

    await user.type(
      screen.getByLabelText('UUID cần kiểm tra'),
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(screen.queryByText(/^Timestamp: /)).not.toBeInTheDocument();
  });

  it('accepts an uppercase UUID without hyphens as valid', async () => {
    const user = userEvent.setup();
    render(<ValidatePanel />);

    await user.type(screen.getByLabelText('UUID cần kiểm tra'), '550E8400E29B41D4A716446655440000');

    expect(screen.getByText('UUID hợp lệ')).toBeInTheDocument();
  });

  it('reports an invalid UUID', async () => {
    const user = userEvent.setup();
    render(<ValidatePanel />);

    await user.type(screen.getByLabelText('UUID cần kiểm tra'), 'not-a-uuid');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('UUID không hợp lệ')).toBeInTheDocument();
  });
});
