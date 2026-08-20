import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToolPanel } from './index';

describe('ToolPanel', () => {
  it('renders the title and children', () => {
    render(
      <ToolPanel title="Pattern">
        <p>panel content</p>
      </ToolPanel>,
    );
    expect(screen.getByText('Pattern')).toBeInTheDocument();
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });

  it('renders headerActions when provided', () => {
    render(
      <ToolPanel title="Pattern" headerActions={<button>Copy</button>}>
        <p>content</p>
      </ToolPanel>,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });
});
