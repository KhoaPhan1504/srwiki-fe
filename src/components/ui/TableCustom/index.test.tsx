import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
