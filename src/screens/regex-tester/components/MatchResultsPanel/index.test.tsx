import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchResultsPanel } from './index';

describe('MatchResultsPanel', () => {
  it('shows "no matches" when there are none', () => {
    render(<MatchResultsPanel matches={[]} truncated={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Không có kết quả khớp');
  });

  it('shows the match count and a row per match', () => {
    render(
      <MatchResultsPanel
        matches={[
          { index: 0, length: 4, value: 'John', groups: [] },
          { index: 11, length: 4, value: 'Khoa', groups: [] },
        ]}
        truncated={false}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('2 kết quả khớp');
    // "John"/"Khoa" each appear twice (summary row + the "Full Match" detail
    // inside the same <details>) — jsdom doesn't hide non-open <details>
    // content the way a real browser's UA stylesheet does, so both are
    // present in the DOM regardless of the collapsed state.
    expect(screen.getAllByText('John').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Khoa').length).toBeGreaterThan(0);
  });

  it('shows a truncated notice when truncated is true', () => {
    render(
      <MatchResultsPanel matches={[{ index: 0, length: 1, value: 'a', groups: [] }]} truncated />,
    );
    expect(screen.getByText('Đã cắt bớt kết quả do số lượng khớp quá lớn.')).toBeInTheDocument();
  });

  it('shows numbered groups when the match has them', () => {
    render(
      <MatchResultsPanel
        matches={[
          { index: 0, length: 17, value: 'john@example.com', groups: ['john', 'example.com'] },
        ]}
        truncated={false}
      />,
    );
    expect(screen.getByText('Nhóm bắt (capture groups)')).toBeInTheDocument();
  });

  it('shows named groups when the match has them', () => {
    render(
      <MatchResultsPanel
        matches={[
          {
            index: 0,
            length: 17,
            value: 'john@example.com',
            groups: ['john', 'example.com'],
            namedGroups: { username: 'john', domain: 'example.com' },
          },
        ]}
        truncated={false}
      />,
    );
    expect(screen.getByText('Nhóm có tên (named groups)')).toBeInTheDocument();
  });

  it('does not render a groups section when there are none', () => {
    render(
      <MatchResultsPanel
        matches={[{ index: 0, length: 1, value: 'a', groups: [] }]}
        truncated={false}
      />,
    );
    expect(screen.queryByText('Nhóm bắt (capture groups)')).not.toBeInTheDocument();
    expect(screen.queryByText('Nhóm có tên (named groups)')).not.toBeInTheDocument();
  });
});
