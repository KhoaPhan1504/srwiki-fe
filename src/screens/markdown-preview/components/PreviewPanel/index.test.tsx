import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewPanel } from '.';

describe('PreviewPanel', () => {
  it('shows an empty state message when there is no rendered HTML', () => {
    render(<PreviewPanel html="" />);
    expect(
      screen.getByText('Bắt đầu soạn Markdown để xem trước kết quả tại đây.'),
    ).toBeInTheDocument();
  });

  it('renders the given sanitized HTML into the document', () => {
    render(<PreviewPanel html="<h1>Hello</h1><p>World</p>" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Hello' })).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });
});
