import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchHighlight } from './index';
import { HIGHLIGHT_MAX_LENGTH } from '~root/constants';

describe('MatchHighlight', () => {
  it('renders nothing when there are no matches', () => {
    const { container } = render(<MatchHighlight testString="hello" matches={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('wraps matched text in a <mark>', () => {
    render(
      <MatchHighlight
        testString="Hello World"
        matches={[{ index: 6, length: 5, value: 'World', groups: [] }]}
      />,
    );
    const mark = screen.getByText('World');
    expect(mark.tagName).toBe('MARK');
  });

  it('preserves non-matched text around the match', () => {
    // Testing Library's default text matcher trims whitespace before
    // comparing, so a trailing space in the query (as in "Hello ") never
    // matches — assert on the rendered container's raw textContent instead.
    const { container } = render(
      <MatchHighlight
        testString="Hello World"
        matches={[{ index: 6, length: 5, value: 'World', groups: [] }]}
      />,
    );
    expect(container.querySelector('pre')?.textContent).toBe('Hello World');
  });

  it('shows a fallback notice instead of highlighting above HIGHLIGHT_MAX_LENGTH', () => {
    const big = 'a'.repeat(HIGHLIGHT_MAX_LENGTH + 1);
    const { container } = render(
      <MatchHighlight
        testString={big}
        matches={[{ index: 0, length: 1, value: 'a', groups: [] }]}
      />,
    );
    expect(container.querySelector('mark')).toBeNull();
    expect(
      screen.getByText('Chuỗi kiểm tra quá lớn để hiển thị highlight — xem bảng kết quả bên dưới.'),
    ).toBeInTheDocument();
  });
});
