import '~root/i18n';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurlGeneratorScreen } from './index';

describe('CurlGeneratorScreen', () => {
  it('renders the tool title', () => {
    render(<CurlGeneratorScreen />);
    expect(screen.getByRole('heading', { name: 'cURL Generator' })).toBeInTheDocument();
  });

  it('shows the empty output state before any URL is entered', () => {
    render(<CurlGeneratorScreen />);
    expect(screen.getByText('Nhập URL yêu cầu để sinh lệnh curl.')).toBeInTheDocument();
  });

  it('generates a GET command live as the URL is typed', async () => {
    const user = userEvent.setup();
    render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');

    expect(screen.getByText("curl -X GET 'https://api.example.com/users'")).toBeInTheDocument();
  });

  it('shows an error in the output panel for an invalid URL', async () => {
    const user = userEvent.setup();
    render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'not-a-url');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('Nhập một URL hợp lệ, ví dụ https://api.example.com.'),
    ).toBeInTheDocument();
  });

  it('adds a query param on the Params tab and reflects it in the generated URL', async () => {
    const user = userEvent.setup();
    render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');
    await user.type(screen.getByPlaceholderText('Tên'), 'page');
    await user.type(screen.getByPlaceholderText('Giá trị'), '2');

    expect(
      screen.getByText("curl -X GET 'https://api.example.com/users?page=2'"),
    ).toBeInTheDocument();
  });

  it('adds a header on the Headers tab and reflects it as an -H flag', async () => {
    const user = userEvent.setup();
    render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');
    await user.click(screen.getByRole('tab', { name: 'Header' }));
    await user.type(screen.getByPlaceholderText('Tên header'), 'X-Api-Key');
    await user.type(screen.getByPlaceholderText('Giá trị header'), 'abc123');

    expect(
      screen.getByText("curl -X GET 'https://api.example.com/users' -H 'X-Api-Key: abc123'"),
    ).toBeInTheDocument();
  });

  it('switches to POST, enables the Body tab, and includes the body in the generated command', async () => {
    const user = userEvent.setup();
    const { container } = render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');
    await user.click(screen.getByRole('combobox', { name: 'Phương thức HTTP' }));
    await user.click(screen.getByRole('option', { name: 'POST' }));

    const bodyTab = screen.getByRole('tab', { name: 'Nội dung' });
    expect(bodyTab).toBeEnabled();
    await user.click(bodyTab);
    const bodyPanel = within(screen.getByRole('tabpanel'));
    await user.type(bodyPanel.getByRole('textbox'), '{{}');

    expect(container.querySelector('pre')?.textContent).toBe(
      "curl -X POST 'https://api.example.com/users' -d '{}'",
    );
  });

  it('disables the Body tab for GET and re-enables it after switching to POST', () => {
    render(<CurlGeneratorScreen />);
    expect(screen.getByRole('tab', { name: 'Nội dung' })).toBeDisabled();
  });

  it('switches command format to multi-line live', async () => {
    const user = userEvent.setup();
    const { container } = render(<CurlGeneratorScreen />);

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');
    await user.click(screen.getByRole('tab', { name: 'Header' }));
    await user.type(screen.getByPlaceholderText('Tên header'), 'X-Api-Key');
    await user.type(screen.getByPlaceholderText('Giá trị header'), 'abc123');

    await user.click(screen.getByRole('tab', { name: 'Nhiều dòng' }));

    expect(container.querySelector('pre')?.textContent).toBe(
      "curl -X GET 'https://api.example.com/users' \\\n  -H 'X-Api-Key: abc123'",
    );
  });

  it('disables Clear when everything is empty, and clears after confirming', async () => {
    const user = userEvent.setup();
    render(<CurlGeneratorScreen />);

    expect(screen.getByRole('button', { name: 'Xoá' })).toBeDisabled();

    await user.type(screen.getByLabelText('URL yêu cầu'), 'https://api.example.com/users');
    const clearButton = screen.getByRole('button', { name: 'Xoá' });
    expect(clearButton).toBeEnabled();

    await user.click(clearButton);
    const confirmButtons = screen.getAllByRole('button', { name: 'Xoá' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    expect(screen.getByLabelText('URL yêu cầu')).toHaveValue('');
    expect(screen.getByText('Nhập URL yêu cầu để sinh lệnh curl.')).toBeInTheDocument();
  });
});
