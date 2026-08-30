import * as React from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

export function PageHeader({
  title,
  description,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb?.length ? (
          <nav aria-label="Đường dẫn" className="mb-1.5">
            <ol className="flex flex-wrap items-center gap-1 text-small text-lv-muted">
              {breadcrumb.map((item, i) => (
                <li key={item.label} className="flex items-center gap-1">
                  {i > 0 ? <IconChevronRight size={13} aria-hidden /> : null}
                  {item.href ? (
                    <Link href={item.href} className="transition-colors duration-button hover:text-lv-gold-700">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-lv-navy-700">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="text-h1-m text-lv-text xl:text-h1">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-body text-lv-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
