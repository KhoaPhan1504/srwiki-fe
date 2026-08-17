import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~root/components/ui/table';
import { Skeleton } from '~root/components/ui/skeleton';
import { Button } from '~root/components/ui/button';
import { cn } from '~root/lib/utils';

export type ColumnAlign = 'left' | 'center' | 'right';

export type ColumnType<T> = {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (row: T, index: number) => React.ReactNode;
  align?: ColumnAlign;
  className?: string;
  headerClassName?: string;
};

type RowKey<T> = keyof T | ((row: T, index: number) => string | number);

export type TableCustomProps<T> = {
  columns: ColumnType<T>[];
  data: T[];
  rowKey: RowKey<T>;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyMessage?: React.ReactNode;
  className?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

const alignClass: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function getRowKeyValue<T>(row: T, index: number, rowKey: RowKey<T>): string | number {
  if (typeof rowKey === 'function') return rowKey(row, index);
  return row[rowKey] as string | number;
}

function getCellValue<T>(row: T, column: ColumnType<T>, index: number): React.ReactNode {
  if (column.render) return column.render(row, index);
  const { accessor } = column;
  if (typeof accessor === 'function') return accessor(row);
  if (accessor) return row[accessor] as React.ReactNode;
  return null;
}

export function TableCustom<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage,
  className,
  pagination,
}: TableCustomProps<T>) {
  const { t } = useTranslation('common');

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;

  return (
    <div className="space-y-4">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(column.align && alignClass[column.align], column.headerClassName)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-muted-foreground"
              >
                {emptyMessage ?? t('table.empty')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={getRowKeyValue(row, index, rowKey)}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(column.align && alignClass[column.align], column.className)}
                  >
                    {getCellValue(row, column, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('table.pagination.pageInfo', { page: pagination.page, totalPages })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              {t('table.pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              {t('table.pagination.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
