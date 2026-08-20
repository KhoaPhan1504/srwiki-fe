import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { describe, expect, it, vi } from 'vitest';
import { convertData, convertLength, convertTemperature } from '~root/utils';
import { OutputPanel } from '.';

const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
};

describe('OutputPanel', () => {
  it('shows the empty state when there is no result', () => {
    render(<OutputPanel result={null} />);
    expect(screen.getByText('Nhập giá trị để chuyển đổi.')).toBeInTheDocument();
  });

  it('lists the converted value for every length unit', () => {
    const result = convertLength('16', 'px');
    render(<OutputPanel result={result} />);
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('lists the converted value for every temperature unit', () => {
    const result = convertTemperature('0', 'C');
    render(<OutputPanel result={result} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });

  it('shows an error for a negative data value', () => {
    const result = convertData('-5', 'KB');
    render(<OutputPanel result={result} />);
    expect(screen.getByText('Dung lượng dữ liệu không thể là số âm.')).toBeInTheDocument();
  });

  it('shows an error for a value below absolute zero', () => {
    const result = convertTemperature('-1', 'K');
    render(<OutputPanel result={result} />);
    expect(
      screen.getByText('Giá trị này thấp hơn độ 0 tuyệt đối, điều không thể xảy ra về mặt vật lý.'),
    ).toBeInTheDocument();
  });

  it('copies a row value to the clipboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    const result = convertLength('16', 'px');
    render(<OutputPanel result={result} />);

    await user.click(screen.getByRole('button', { name: 'Copy px' }));
    expect(writeText).toHaveBeenCalledWith('16');
  });
});
