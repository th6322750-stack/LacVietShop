"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconBuildingStore, IconCash, IconPlus, IconServer, IconUsers, IconWorld } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { Column, DataTable, FilterBar } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select, Switch, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { childPanels, resellerPrices } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { formatDate, formatMoney, formatNumber, formatUnitPrice } from "@/lib/utils";
import type { ChildPanel } from "@/types";

const createSchema = z.object({
  subdomain: z
    .string()
    .min(3, "Tên miền con tối thiểu 3 ký tự.")
    .max(30, "Tối đa 30 ký tự.")
    .regex(/^[a-z0-9-]+$/u, "Chỉ dùng chữ thường, số và dấu gạch ngang."),
  brandName: z.string().min(2, "Nhập tên thương hiệu."),
  plan: z.string().min(1),
  supportContact: z.string().max(120).optional(),
  description: z.string().max(300).optional(),
});

type CreateValues = z.input<typeof createSchema>;

export function ChildPanelView() {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [autoApprove, setAutoApprove] = React.useState(false);
  const [customDomain, setCustomDomain] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { subdomain: "", brandName: "", plan: "basic", supportContact: "", description: "" },
    mode: "onBlur",
  });

  const subdomain = watch("subdomain") || "ten-cua-ban";

  const filtered = childPanels.filter((p) =>
    `${p.subdomain} ${p.ownerName} ${p.plan}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const totals = {
    panels: childPanels.length,
    members: childPanels.reduce((s, p) => s + p.members, 0),
    revenue: childPanels.reduce((s, p) => s + p.revenue, 0),
  };

  const columns: Column<ChildPanel>[] = [
    {
      key: "panel",
      header: "Panel",
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate text-body-strong text-lv-text">
            {p.subdomain}.{demoBrand.domain}
          </p>
          <p className="text-small text-lv-muted">Chủ sở hữu: {p.ownerName}</p>
          <p className="text-small text-lv-muted">Tạo {formatDate(p.createdAt)}</p>
        </div>
      ),
    },
    { key: "plan", header: "Gói", cell: (p) => <Badge tone="neutral">{p.plan}</Badge> },
    { key: "members", header: "Thành viên", align: "right", cell: (p) => formatNumber(p.members) },
    {
      key: "revenue",
      header: "Doanh thu",
      align: "right",
      cell: (p) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(p.revenue)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (p) =>
        p.status === "active" ? (
          <Badge tone="success">Đang chạy</Badge>
        ) : p.status === "pending" ? (
          <Badge tone="warning">Chờ duyệt</Badge>
        ) : (
          <Badge tone="danger">Tạm khoá</Badge>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Panel con / Đại lý con"
        description="Mở website bán dịch vụ mang thương hiệu riêng, lấy giá sỉ từ hệ thống Lạc Việt."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Panel con" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Panel đang quản lý" value={totals.panels} suffix="panel" tone="gold" icon={<IconServer size={20} />} />
        <StatCard label="Tổng thành viên" value={formatNumber(totals.members)} suffix="người" tone="navy" icon={<IconUsers size={20} />} />
        <StatCard label="Doanh thu panel con" value={formatMoney(totals.revenue)} tone="success" icon={<IconCash size={20} />} />
        <StatCard label="Chiết khấu đại lý" value="15–17%" tone="info" icon={<IconBuildingStore size={20} />} hint="Theo bảng giá sỉ" />
      </div>

      <InfoCard title="Panel con trong bản dựng này là mô phỏng" tone="warning" icon={<IconWorld size={16} />}>
        Việc tạo panel chưa tạo tên miền, DNS hay tài khoản thật. Gap:{" "}
        <code className="text-small">childPanel.provisioning</code>.
      </InfoCard>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard title="Tạo panel con" description="Điền thông tin để khởi tạo website bán hàng riêng." className="min-w-0 xl:col-span-5">
          <form
            onSubmit={handleSubmit(() =>
              toast.push({
                tone: "success",
                title: "Đã ghi nhận yêu cầu tạo panel (DEMO)",
                description: "Không có tên miền hay tài khoản thật nào được tạo.",
              }),
            )}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="subdomain" required>
                Tên miền con
              </Label>
              <Input
                id="subdomain"
                placeholder="ten-cua-ban"
                tone={errors.subdomain ? "invalid" : "default"}
                {...register("subdomain")}
              />
              <p className="mt-1 text-small text-lv-muted">
                Địa chỉ dự kiến:{" "}
                <span className="text-lv-navy-700">
                  {subdomain}.{demoBrand.domain}
                </span>
              </p>
              <FieldMessage>{errors.subdomain?.message}</FieldMessage>
            </div>

            <div>
              <Label htmlFor="brandName" required>
                Tên thương hiệu hiển thị
              </Label>
              <Input id="brandName" placeholder="Ví dụ: Media Store" tone={errors.brandName ? "invalid" : "default"} {...register("brandName")} />
              <FieldMessage>{errors.brandName?.message}</FieldMessage>
            </div>

            <div>
              <Label htmlFor="plan" required>
                Gói dịch vụ
              </Label>
              <Select id="plan" {...register("plan")}>
                <option value="basic">Gói cơ bản</option>
                <option value="pro">Gói chuyên nghiệp</option>
                <option value="enterprise">Gói doanh nghiệp</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="supportContact">Kênh hỗ trợ hiển thị trên panel</Label>
              <Input id="supportContact" placeholder="Zalo / Telegram / Hotline" {...register("supportContact")} />
            </div>

            <div>
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea id="description" placeholder="Giới thiệu ngắn hiển thị ở trang chủ panel" {...register("description")} />
            </div>

            <Button type="submit" block icon={<IconPlus size={17} />}>
              Tạo panel con
            </Button>
          </form>
        </SectionCard>

        <div className="min-w-0 space-y-5 xl:col-span-7">
          <SectionCard title="Cấu hình thương hiệu & hỗ trợ" description="Áp dụng cho toàn bộ panel con của bạn.">
            <div className="space-y-4">
              <Switch
                id="auto-approve"
                checked={autoApprove}
                onCheckedChange={setAutoApprove}
                label="Tự động duyệt thành viên mới"
                description="Thành viên đăng ký trên panel con được kích hoạt ngay."
              />
              <Switch
                id="custom-domain"
                checked={customDomain}
                onCheckedChange={setCustomDomain}
                label="Cho phép tên miền riêng"
                description="Đại lý có thể trỏ tên miền của họ về panel."
              />
              {customDomain ? (
                <InfoCard title="Cần cấu hình DNS thật" tone="warning">
                  Tính năng này cần quyền quản trị DNS và chứng chỉ TLS. Chưa khả dụng trong bản dựng DEMO.
                </InfoCard>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="Bảng giá sỉ cho đại lý" description="Giá gốc áp dụng khi panel con bán lại." padded={false}>
            <div className="lv-scroll-x">
              <table className="w-full min-w-[560px] border-collapse text-body">
                <caption className="sr-only">Bảng giá sỉ dành cho panel con</caption>
                <thead>
                  <tr className="border-b border-lv-border text-left">
                    <th scope="col" className="px-5 py-2.5 text-label uppercase tracking-wide text-lv-muted">
                      Dịch vụ
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right text-label uppercase tracking-wide text-lv-muted">
                      Giá lẻ
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right text-label uppercase tracking-wide text-lv-muted">
                      Giá sỉ
                    </th>
                    <th scope="col" className="px-5 py-2.5 text-right text-label uppercase tracking-wide text-lv-muted">
                      Biên lợi nhuận
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resellerPrices.map((r) => (
                    <tr key={r.service} className="border-b border-lv-border last:border-0">
                      <td className="px-5 py-3 text-body-strong text-lv-text">{r.service}</td>
                      <td className="lv-price px-3 py-3 text-right text-lv-muted">{formatUnitPrice(r.retail)}</td>
                      <td className="lv-price px-3 py-3 text-right text-body-strong text-lv-gold-700">
                        {formatUnitPrice(r.reseller)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Badge tone="success">{r.margin}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Danh sách panel con" description={`${filtered.length} panel`} padded={false}>
        <div className="px-5 py-4">
          <FilterBar search={search} onSearch={setSearch} placeholder="Tìm theo tên miền, chủ sở hữu…" />
        </div>
        <DataTable
          caption="Danh sách panel con đang quản lý"
          columns={columns}
          rows={filtered}
          emptyTitle="Chưa có panel con nào"
          emptyDescription="Tạo panel đầu tiên để bắt đầu bán hàng dưới thương hiệu riêng."
        />
      </SectionCard>
    </div>
  );
}
