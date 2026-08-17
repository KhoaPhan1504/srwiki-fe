import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DateRange } from 'react-day-picker';
import { ChevronDown, ChevronsUpDown, ChevronUp, Columns3, Funnel } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '~root/components/ui/popover';
import { Input } from '~root/components/ui/input';
import { Checkbox } from '~root/components/ui/checkbox';
import { Calendar } from '~root/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~root/components/ui/dropdown-menu';
import { cn } from '~root/lib/utils';

export type ColumnAlign = 'left' | 'center' | 'right';
export type SortDirection = 'asc' | 'desc';
export type SortState = { column: string; direction: SortDirection };

export type FilterValue = string | string[] | { from?: Date; to?: Date };

export type ColumnFilterConfig =
  | { type: 'text'; placeholder?: string }
  | { type: 'multiSelect'; options: { value: string; label: React.ReactNode }[] }
  | { type: 'dateRange' };

export type ColumnType<T> = {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  render?: (row: T, index: number) => React.ReactNode;
  align?: ColumnAlign;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  filter?: ColumnFilterConfig;
  pinned?: 'left' | 'right';
  hideable?: boolean;
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
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  filters?: Record<string, FilterValue>;
  onFiltersChange?: (filters: Record<string, FilterValue>) => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  showRowNumber?: boolean;
};

const ROW_NUMBER_COLUMN_KEY = '#';

const alignClass: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const pinnedClass = {
  left: 'sticky left-0 z-10 bg-background shadow-[2px_0_4px_-2px_rgb(0_0_0_/_0.15)]',
  right: 'sticky right-0 z-10 bg-background shadow-[-2px_0_4px_-2px_rgb(0_0_0_/_0.15)]',
};

function pinnedClassFor<T>(column: ColumnType<T>, firstLeftKey?: string, firstRightKey?: string) {
  if (column.pinned === 'left' && column.key === firstLeftKey) return pinnedClass.left;
  if (column.pinned === 'right' && column.key === firstRightKey) return pinnedClass.right;
  return '';
}

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

function SortIcon({ state }: { state: SortDirection | null }) {
  if (state === 'asc') return <ChevronUp className="h-3.5 w-3.5" />;
  if (state === 'desc') return <ChevronDown className="h-3.5 w-3.5" />;
  return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
}

function ColumnFilterForm({
  filter,
  value,
  onApply,
  onClear,
  applyLabel,
  clearLabel,
}: {
  filter: ColumnFilterConfig;
  value: FilterValue | undefined;
  onApply: (value: FilterValue) => void;
  onClear: () => void;
  applyLabel: string;
  clearLabel: string;
}) {
  const [text, setText] = useState(typeof value === 'string' ? value : '');
  const [selected, setSelected] = useState<string[]>(Array.isArray(value) ? value : []);
  const initialRange: DateRange | undefined =
    value && typeof value === 'object' && !Array.isArray(value)
      ? { from: value.from, to: value.to }
      : undefined;
  const [range, setRange] = useState<DateRange | undefined>(initialRange);

  if (filter.type === 'text') {
    return (
      <div className="flex flex-col gap-3">
        <Input
          value={text}
          placeholder={filter.placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onApply(text)}
        />
        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
          <Button type="button" size="sm" onClick={() => onApply(text)}>
            {applyLabel}
          </Button>
        </div>
      </div>
    );
  }

  if (filter.type === 'multiSelect') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {filter.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) =>
                  setSelected((prev) =>
                    checked === true
                      ? [...prev, option.value]
                      : prev.filter((v) => v !== option.value),
                  )
                }
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            {clearLabel}
          </Button>
          <Button type="button" size="sm" onClick={() => onApply(selected)}>
            {applyLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Calendar mode="range" selected={range} onSelect={setRange} />
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="sm" onClick={onClear}>
          {clearLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => onApply({ from: range?.from, to: range?.to })}
        >
          {applyLabel}
        </Button>
      </div>
    </div>
  );
}

function ColumnFilterButton<T>({
  column,
  value,
  onApply,
  onClear,
}: {
  column: ColumnType<T>;
  value: FilterValue | undefined;
  onApply: (value: FilterValue) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const { filter } = column;
  if (!filter) return null;

  const isActive = Array.isArray(value)
    ? value.length > 0
    : typeof value === 'string'
      ? value.length > 0
      : Boolean(value && (value.from || value.to));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`filter-${column.key}`}
          className={cn('ml-1 inline-flex', isActive ? 'text-primary' : 'text-muted-foreground')}
        >
          <Funnel className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <ColumnFilterForm
          filter={filter}
          value={value}
          onApply={(next) => {
            onApply(next);
            setOpen(false);
          }}
          onClear={() => {
            onClear();
            setOpen(false);
          }}
          applyLabel={t('table.filter.apply')}
          clearLabel={t('table.filter.clear')}
        />
      </PopoverContent>
    </Popover>
  );
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
  sort,
  onSortChange,
  filters = {},
  onFiltersChange,
  columnVisibility,
  onColumnVisibilityChange,
  showRowNumber = true,
}: TableCustomProps<T>) {
  const { t } = useTranslation('common');
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>({});
  const visibility = columnVisibility ?? internalVisibility;
  const setVisibility = onColumnVisibilityChange ?? setInternalVisibility;

  const rowNumberColumn: ColumnType<T> = {
    key: ROW_NUMBER_COLUMN_KEY,
    header: '#',
    pinned: 'left',
    hideable: false,
    headerClassName: 'w-16',
    className: 'w-16',
    render: (_row, index) =>
      pagination ? (pagination.page - 1) * pagination.pageSize + index + 1 : index + 1,
  };
  const allColumns = showRowNumber ? [rowNumberColumn, ...columns] : columns;

  const visibleColumns = allColumns.filter((column) => visibility[column.key] !== false);
  const hideableColumns = allColumns.filter((column) => column.hideable !== false);

  const handleSortClick = (column: ColumnType<T>) => {
    if (!column.sortable || !onSortChange) return;
    if (sort?.column !== column.key) {
      onSortChange({ column: column.key, direction: 'asc' });
    } else if (sort.direction === 'asc') {
      onSortChange({ column: column.key, direction: 'desc' });
    } else {
      onSortChange(null);
    }
  };

  const firstLeftKey = allColumns.find((column) => column.pinned === 'left')?.key;
  const firstRightKey = allColumns.find((column) => column.pinned === 'right')?.key;

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;

  return (
    <div className="space-y-4">
      {hideableColumns.length > 0 && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 className="mr-2 h-4 w-4" />
                {t('table.columns')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {hideableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={visibility[column.key] !== false}
                  onCheckedChange={(checked) =>
                    setVisibility({ ...visibility, [column.key]: checked })
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  column.align && alignClass[column.align],
                  pinnedClassFor(column, firstLeftKey, firstRightKey),
                  column.headerClassName,
                )}
              >
                <div className="flex items-center gap-1">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => handleSortClick(column)}
                    >
                      {column.header}
                      <SortIcon state={sort?.column === column.key ? sort.direction : null} />
                    </button>
                  ) : (
                    column.header
                  )}
                  {column.filter && onFiltersChange && (
                    <ColumnFilterButton
                      column={column}
                      value={filters[column.key]}
                      onApply={(value) => onFiltersChange({ ...filters, [column.key]: value })}
                      onClear={() => {
                        const next = { ...filters };
                        delete next[column.key];
                        onFiltersChange(next);
                      }}
                    />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {visibleColumns.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length}
                className="py-10 text-center text-muted-foreground"
              >
                {emptyMessage ?? t('table.empty')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow key={getRowKeyValue(row, index, rowKey)}>
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      column.align && alignClass[column.align],
                      pinnedClassFor(column, firstLeftKey, firstRightKey),
                      column.className,
                    )}
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
