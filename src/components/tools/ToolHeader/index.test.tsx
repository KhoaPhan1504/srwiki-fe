import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Braces } from 'lucide-react';
import { ToolHeader } from './index';

describe('ToolHeader', () => {
  it('renders the title and description', () => {
    render(<ToolHeader title="Regex Tester" description="Test patterns." icon={Braces} />);
    expect(screen.getByRole('heading', { name: 'Regex Tester' })).toBeInTheDocument();
    expect(screen.getByText('Test patterns.')).toBeInTheDocument();
  });
});
