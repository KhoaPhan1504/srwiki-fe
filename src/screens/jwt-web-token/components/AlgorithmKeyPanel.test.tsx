import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { AlgorithmKeyPanel } from './AlgorithmKeyPanel';

const baseProps = {
  algorithm: 'HS256' as const,
  onAlgorithmChange: vi.fn(),
  secret: '',
  onSecretChange: vi.fn(),
  privateKey: '',
  onPrivateKeyChange: vi.fn(),
  publicKey: '',
  onPublicKeyChange: vi.fn(),
  signError: null,
};

describe('AlgorithmKeyPanel', () => {
  it('shows a single Secret field for an HMAC algorithm', () => {
    render(<AlgorithmKeyPanel {...baseProps} algorithm="HS256" />);
    expect(screen.getByLabelText('Secret')).toBeInTheDocument();
    expect(screen.queryByLabelText('Private Key')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Public Key')).not.toBeInTheDocument();
  });

  it('calls onSecretChange as the user types the secret', async () => {
    const user = userEvent.setup();
    const onSecretChange = vi.fn();
    render(<AlgorithmKeyPanel {...baseProps} algorithm="HS256" onSecretChange={onSecretChange} />);

    await user.type(screen.getByLabelText('Secret'), 'a');
    expect(onSecretChange).toHaveBeenCalledWith('a');
  });

  it('shows Private Key and Public Key fields for an RSA algorithm', () => {
    render(<AlgorithmKeyPanel {...baseProps} algorithm="RS256" />);
    expect(screen.getByLabelText('Private Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Public Key')).toBeInTheDocument();
    expect(screen.queryByLabelText('Secret')).not.toBeInTheDocument();
  });

  it('shows Private Key and Public Key fields for an RSA-PSS algorithm', () => {
    render(<AlgorithmKeyPanel {...baseProps} algorithm="PS256" />);
    expect(screen.getByLabelText('Private Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Public Key')).toBeInTheDocument();
  });

  it('shows Private Key and Public Key fields for an ECDSA algorithm', () => {
    render(<AlgorithmKeyPanel {...baseProps} algorithm="ES256" />);
    expect(screen.getByLabelText('Private Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Public Key')).toBeInTheDocument();
  });

  it('calls onPrivateKeyChange and onPublicKeyChange as the user types', async () => {
    const user = userEvent.setup();
    const onPrivateKeyChange = vi.fn();
    const onPublicKeyChange = vi.fn();
    render(
      <AlgorithmKeyPanel
        {...baseProps}
        algorithm="RS256"
        onPrivateKeyChange={onPrivateKeyChange}
        onPublicKeyChange={onPublicKeyChange}
      />,
    );

    await user.type(screen.getByLabelText('Private Key'), 'a');
    expect(onPrivateKeyChange).toHaveBeenCalledWith('a');

    await user.type(screen.getByLabelText('Public Key'), 'b');
    expect(onPublicKeyChange).toHaveBeenCalledWith('b');
  });

  it('lists all 12 algorithms grouped by family', async () => {
    const user = userEvent.setup();
    render(<AlgorithmKeyPanel {...baseProps} />);

    await user.click(screen.getByLabelText('Algorithm'));

    expect(screen.getByText('HMAC')).toBeInTheDocument();
    expect(screen.getByText('RSA-PSS')).toBeInTheDocument();
    expect(screen.getByText('ECDSA')).toBeInTheDocument();
    for (const alg of [
      'HS256',
      'HS384',
      'HS512',
      'RS256',
      'RS384',
      'RS512',
      'PS256',
      'PS384',
      'PS512',
      'ES256',
      'ES384',
      'ES512',
    ]) {
      expect(screen.getByRole('option', { name: alg })).toBeInTheDocument();
    }
  });

  it('calls onAlgorithmChange when a different algorithm is selected', async () => {
    const user = userEvent.setup();
    const onAlgorithmChange = vi.fn();
    render(<AlgorithmKeyPanel {...baseProps} onAlgorithmChange={onAlgorithmChange} />);

    await user.click(screen.getByLabelText('Algorithm'));
    await user.click(screen.getByRole('option', { name: 'RS256' }));

    expect(onAlgorithmChange).toHaveBeenCalledWith('RS256');
  });

  it('shows no error message when signError is null', () => {
    render(<AlgorithmKeyPanel {...baseProps} algorithm="HS256" signError={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a translated INVALID_KEY message next to the Secret field for HMAC', () => {
    render(
      <AlgorithmKeyPanel
        {...baseProps}
        algorithm="HS256"
        signError={{ code: 'INVALID_KEY', message: 'raw' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Khoá này không hợp lệ hoặc sai định dạng.',
    );
  });

  it('shows a translated INVALID_KEY message next to the Private Key field for RSA', () => {
    render(
      <AlgorithmKeyPanel
        {...baseProps}
        algorithm="RS256"
        signError={{ code: 'INVALID_KEY', message: 'raw' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Khoá này không hợp lệ hoặc sai định dạng.',
    );
  });

  it('shows a translated SIGNING_FAILED message', () => {
    render(
      <AlgorithmKeyPanel
        {...baseProps}
        algorithm="HS256"
        signError={{ code: 'SIGNING_FAILED', message: 'raw' }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Ký token thất bại với khoá hiện tại.');
  });
});
