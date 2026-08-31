"use client";

import * as React from "react";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Field";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "./States";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  cell: (row: T) => React.ReactNode;
}

/**
 * Bảng dữ liệu dùng chung: có trạng thái loading/empty/error, cuộn ngang trong
 * thẻ ở màn hẹp (<768) và hàng chọn được (PROJECT_HANDOFF §9).
 */
export function DataTable<T>({
  columns,
  rows,
  state = "ready",
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription,
  emptyAction,
  onRetry,
  selectedId,
  onSelect,
  caption,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  state?: "ready" | "loading" | "error";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  selectedId?: string | null;
  onSelect?: (row: T) => void;
  caption: string;
  /** Định danh hàng. Bỏ trống thì dùng thuộc tính `id` của hàng. */
  rowKey?: (row: T) => string;
}) {
  const keyOf = (row: T) => (rowKey ? rowKey(row) : String((row as { id?: unknown }).id));
  if (state === "error") {
    return <ErrorState onRetry={onRetry} />;
  }

  if (state === "ready" && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="lv-scroll-x">
      <table className="w-full min-w-[720px] border-collapse text-body">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-lv-border text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "px-3 py-2.5 text-label uppercase tracking-wide text-lv-muted",
                  c.align === "right" && "text-right",
                  c.align === "center" && "text-center",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state === "loading" ? (
            <SkeletonRows rows={6} cols={columns.length} />
          ) : (
            rows.map((row) => {
              const key = keyOf(row);
              const selected = selectedId === key;
              return (
                <tr
                  key={key}
                  onClick={onSelect ? () => onSelect(row) : undefined}
                  tabIndex={onSelect ? 0 : undefined}
                  onKeyDown={
                    onSelect
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(row);
                          }
                        }
                      : undefined
                  }
                  aria-selected={onSelect ? selected : undefined}
                  className={cn(
                    "border-b border-lv-border last:border-0 transition-colors duration-button",
                    onSelect && "cursor-pointer hover:bg-lv-gold-50/60",
                    selected && "bg-lv-gold-50",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-3.5 align-middle",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export function FilterBar({
  search,
  onSearch,
  placeholder = "Tìm kiếm…",
  children,
  right,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    // Ô nhập rộng 100% nên nếu thả thẳng vào flex thì mỗi ô rơi xuống một dòng.
    // Bọc từng ô lọc vào khung bề rộng cố định để cả hàng nằm gọn trên một dòng.
    <div className="flex flex-wrap items-end gap-2.5">
      {onSearch ? (
        <div className="min-w-[220px] flex-1 basis-[260px]">
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            prefix={<IconSearch size={16} />}
            aria-label={placeholder}
          />
        </div>
      ) : null}
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child) ? (
          <div key={i} className="w-[calc(50%-5px)] shrink-0 sm:w-[172px]">
            {child}
          </div>
        ) : (
          child
        ),
      )}
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  total: number;
  pageSize: number;
}) {
  if (pageCount <= 1) {
    return (
      <p className="text-small text-lv-muted">
        Hiển thị {total} / {total} mục
      </p>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPages(page, pageCount);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-small text-lv-muted">
        Hiển thị {from}–{to} trong {total} mục
      </p>
      <nav className="flex items-center gap-1" aria-label="Phân trang">
        <PageButton disabled={page === 1} onClick={() => onChange(page - 1)} label="Trang trước">
          <IconChevronLeft size={16} />
        </PageButton>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-2 text-small text-lv-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "h-8 min-w-8 rounded-control px-2 text-small-strong transition-colors duration-button",
                p === page
                  ? "bg-lv-gold-600 text-white"
                  : "border border-lv-border text-lv-navy-700 hover:border-lv-border-gold hover:bg-lv-gold-50",
              )}
            >
              {p}
            </button>
          ),
        )}
        <PageButton disabled={page === pageCount} onClick={() => onChange(page + 1)} label="Trang sau">
          <IconChevronRight size={16} />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({
  children,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-control border border-lv-border text-lv-navy-700 transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50 disabled:opacity-40 disabled:hover:border-lv-border disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function buildPages(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", pageCount];
  if (page >= pageCount - 3) return [1, "…", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  return [1, "…", page - 1, page, page + 1, "…", pageCount];
}

/** Hook phân trang dùng chung cho các màn danh sách. */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const slice = items.slice((current - 1) * pageSize, current * pageSize);
  React.useEffect(() => {
    setPage(1);
  }, [items.length]);
  return { page: current, pageCount, slice, setPage, total: items.length, pageSize };
}
