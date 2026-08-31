import * as React from "react";
import { IconAlertTriangle, IconInbox, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Chưa có dữ liệu",
  description,
  action,
  icon,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-card border border-lv-border bg-lv-bg text-lv-muted">
        {icon ?? <IconInbox size={22} />}
      </span>
      <p className="mt-3 text-card-title text-lv-text">{title}</p>
      {description ? <p className="mt-1 max-w-md text-small text-lv-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Kết nối tới máy chủ đang gặp sự cố. Bạn thử tải lại giúp nhé.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-card border border-lv-danger/25 bg-lv-danger/[0.07] text-lv-danger">
        <IconAlertTriangle size={22} />
      </span>
      <p className="mt-3 text-card-title text-lv-text">{title}</p>
      <p className="mt-1 max-w-md text-small text-lv-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-4" onClick={onRetry} icon={<IconRefresh size={16} />}>
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}

export function PartialDataNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-control border border-lv-warning/30 bg-lv-warning/[0.07] px-3 py-2 text-small text-lv-warning">
      {children}
    </p>
  );
}
