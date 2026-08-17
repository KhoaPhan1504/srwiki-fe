import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '~root/i18n';
import { TableCustom, type ColumnType } from './index';

type Row = { id: string; name: string; age: number };

const ROWS: Row[] = [
  { id: 'r1', name: 'Alice', age: 30 },
  { id: 'r2', name: 'Bob', age: 25 },
];

const COLUMNS: ColumnType<Row>[] = [
  { key: 'name', header: 'Name', accessor: 'name' },
  { key: 'age', header: 'Age', render: (row) => `${row.age}y` },
];

describe('TableCustom', () => {
  it('renders column headers', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders cell values via accessor and render', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30y')).toBeInTheDocument();
  });

  it('derives the row key via a function when rowKey is a function', () => {
    const rowKeyFn = vi.fn((row: Row) => `custom-${row.id}`);
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey={rowKeyFn} />);
    expect(rowKeyFn).toHaveBeenCalledWith(ROWS[0], 0);
  });

  it('shows skeleton rows while loading instead of data', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" isLoading skeletonRows={3} />);
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);
  });

  it('shows the default empty message when data is empty', () => {
    render(<TableCustom columns={COLUMNS} data={[]} rowKey="id" />);
    expect(screen.getByText('Không có dữ liệu')).toBeInTheDocument();
  });

  it('shows a custom empty message when provided', () => {
    render(<TableCustom columns={COLUMNS} data={[]} rowKey="id" emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('does not render pagination controls when the prop is omitted', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.queryByText(/Trước/)).not.toBeInTheDocument();
  });

  it('renders page info and disables the previous button on the first page', () => {
    const onPageChange = vi.fn();
    render(
      <TableCustom
        columns={COLUMNS}
        data={ROWS}
        rowKey="id"
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />,
    );
    expect(screen.getByText('Trang 1 / 3')).toBeInTheDocument();
    expect(screen.getByText('Trước').closest('button')).toBeDisabled();
    expect(screen.getByText('Sau').closest('button')).not.toBeDisabled();
  });

  it('disables the next button on the last page and calls onPageChange', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <TableCustom
        columns={COLUMNS}
        data={ROWS}
        rowKey="id"
        pagination={{ page: 3, pageSize: 10, total: 25, onPageChange }}
      />,
    );
    expect(screen.getByText('Sau').closest('button')).toBeDisabled();
    await user.click(screen.getByText('Trước'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('cycles sort state on a sortable column: none -> asc -> desc -> none', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const sortableColumns: ColumnType<Row>[] = [
      { key: 'name', header: 'Name', accessor: 'name', sortable: true },
    ];
    const { rerender } = render(
      <TableCustom
        columns={sortableColumns}
        data={ROWS}
        rowKey="id"
        sort={null}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'asc' });

    rerender(
      <TableCustom
        columns={sortableColumns}
        data={ROWS}
        rowKey="id"
        sort={{ column: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenLastCalledWith({ column: 'name', direction: 'desc' });

    rerender(
      <TableCustom
        columns={sortableColumns}
        data={ROWS}
        rowKey="id"
        sort={{ column: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );
    await user.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenLastCalledWith(null);
  });

  it('clicking a different sortable column always starts at asc', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const sortableColumns: ColumnType<Row>[] = [
      { key: 'name', header: 'Name', accessor: 'name', sortable: true },
      { key: 'age', header: 'Age', accessor: (row) => String(row.age), sortable: true },
    ];
    render(
      <TableCustom
        columns={sortableColumns}
        data={ROWS}
        rowKey="id"
        sort={{ column: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByText('Age'));
    expect(onSortChange).toHaveBeenCalledWith({ column: 'age', direction: 'asc' });
  });

  it('a non-sortable column header is not a button', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.getByText('Name').closest('button')).not.toBeInTheDocument();
  });

  it('applies a text filter and calls onFiltersChange', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const filterColumns: ColumnType<Row>[] = [
      { key: 'name', header: 'Name', accessor: 'name', filter: { type: 'text' } },
    ];
    render(
      <TableCustom
        columns={filterColumns}
        data={ROWS}
        rowKey="id"
        filters={{}}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByLabelText('filter-name'));
    await user.type(screen.getByRole('textbox'), 'Ali');
    await user.click(screen.getByText('Áp dụng'));

    expect(onFiltersChange).toHaveBeenCalledWith({ name: 'Ali' });
  });

  it('applies a multiSelect filter with the checked options', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const filterColumns: ColumnType<Row>[] = [
      {
        key: 'name',
        header: 'Name',
        accessor: 'name',
        filter: {
          type: 'multiSelect',
          options: [
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ],
        },
      },
    ];
    render(
      <TableCustom
        columns={filterColumns}
        data={ROWS}
        rowKey="id"
        filters={{}}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByLabelText('filter-name'));
    await user.click(screen.getByText('Option B'));
    await user.click(screen.getByText('Áp dụng'));

    expect(onFiltersChange).toHaveBeenCalledWith({ name: ['b'] });
  });

  it('clearing a filter removes its key from the filters object', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const filterColumns: ColumnType<Row>[] = [
      { key: 'name', header: 'Name', accessor: 'name', filter: { type: 'text' } },
      { key: 'age', header: 'Age', accessor: (row) => String(row.age) },
    ];
    render(
      <TableCustom
        columns={filterColumns}
        data={ROWS}
        rowKey="id"
        filters={{ name: 'Ali', age: 'irrelevant' }}
        onFiltersChange={onFiltersChange}
      />,
    );

    await user.click(screen.getByLabelText('filter-name'));
    await user.click(screen.getByText('Xoá'));

    expect(onFiltersChange).toHaveBeenCalledWith({ age: 'irrelevant' });
  });

  it('a column without filter config has no filter icon', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.queryByLabelText('filter-name')).not.toBeInTheDocument();
  });

  it('applies sticky-right styling to a pinned="right" column', () => {
    const pinnedColumns: ColumnType<Row>[] = [
      { key: 'name', header: 'Name', accessor: 'name' },
      { key: 'age', header: 'Age', accessor: (row) => String(row.age), pinned: 'right' },
    ];
    render(<TableCustom columns={pinnedColumns} data={ROWS} rowKey="id" />);
    expect(screen.getByText('Age').closest('th')).toHaveClass('sticky', 'right-0');
  });

  it('does not apply sticky styling to a column without pinned', () => {
    render(<TableCustom columns={COLUMNS} data={ROWS} rowKey="id" />);
    expect(screen.getByText('Name').closest('th')).not.toHaveClass('sticky');
  });
});
