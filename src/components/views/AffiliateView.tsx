"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bar, BarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { IconCash, IconPercentage, IconTrophy, IconUsersGroup } from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { ChartCard, CopyButton, QRCard } from "@/components/blocks/Media";
import { Column, DataTable } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { affiliateStats, commissionSeries, commissionTiers, referredUsers } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { cn, formatCompact, formatDate, formatMoney, formatPercent } from "@/lib/utils";
import type { ReferredUser } from "@/types";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(100_000, "Rút tối thiểu 100.000 ₫."),
  method: z.string().min(1, "Chọn phương thức nhận tiền."),
  account: z.string().min(6, "Nhập số tài khoản nhận tiền."),
});

type WithdrawValues = z.input<typeof withdrawSchema>;

const levelLabels: Record<ReferredUser["level"], string> = {
  member: "Thành viên",
  collaborator: "Cộng tác viên",
  agency: "Đại lý",
  distributor: "Nhà phân phối",
};

export function AffiliateView() {
  const toast = useToast();
  const referralUrl = `https://${demoBrand.domain}${affiliateStats.referralPath}`;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 500_000, method: "bank", account: "" },
    mode: "onBlur",
  });

  const columns: Column<ReferredUser>[] = [
    {
      key: "user",
      header: "Người được giới thiệu",
      cell: (u) => (
        <div className="min-w-0">
          <p className="truncate text-body-strong text-lv-text">{u.name}</p>
          <p className="text-small text-lv-muted">Tham gia {formatDate(u.joinedAt)}</p>
        </div>
      ),
    },
    { key: "level", header: "Cấp bậc", cell: (u) => <Badge tone="neutral">{levelLabels[u.level]}</Badge> },
    {
      key: "spent",
      header: "Doanh số",
      align: "right",
      cell: (u) => <span className="lv-price text-lv-navy-700">{formatMoney(u.totalSpent)}</span>,
    },
    {
      key: "commission",
      header: "Hoa hồng",
      align: "right",
      cell: (u) => <span className="lv-price text-body-strong text-lv-success">{formatMoney(u.commission)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (u) => (u.status === "active" ? <Badge tone="success">Hoạt động</Badge> : <Badge tone="neutral">Ngưng</Badge>),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Affiliate / Đại lý"
        description="Giới thiệu khách hàng mới và nhận hoa hồng theo doanh số phát sinh."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Affiliate / Đại lý" }]}
        action={<Badge tone="gold">{affiliateStats.tier}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng hoa hồng" value={formatMoney(affiliateStats.totalCommission)} tone="gold" icon={<IconCash size={20} />} />
        <StatCard label="Chờ đối soát" value={formatMoney(affiliateStats.pendingCommission)} tone="info" icon={<IconCash size={20} />} />
        <StatCard label="Người giới thiệu" value={affiliateStats.referrals} suffix="người" tone="navy" icon={<IconUsersGroup size={20} />} />
        <StatCard label="Tỉ lệ chuyển đổi" value={formatPercent(affiliateStats.conversionRate)} tone="success" icon={<IconPercentage size={20} />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard title="Liên kết giới thiệu" description="Chia sẻ liên kết này để ghi nhận khách hàng mới." className="min-w-0 xl:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-control border border-lv-border bg-lv-bg px-3 py-2 text-body text-lv-navy-700">
              {referralUrl}
            </code>
            <CopyButton value={referralUrl} label="Sao chép liên kết" />
          </div>

          <div className="mt-4">
            <QRCard
              assetKey="deposit.realQr"
              title="QR liên kết giới thiệu"
              lines={[
                { label: "Mã giới thiệu", value: affiliateStats.referralPath.replace("/r/", ""), copyable: true },
                { label: "Hạng hiện tại", value: affiliateStats.tier },
                { label: "Hạng kế tiếp", value: affiliateStats.nextTier },
              ]}
              notice={
                <InfoCard title="Tên miền thật chưa được cấu hình" tone="warning">
                  Liên kết đang dùng domain trình diễn. Gap: <code className="text-small">brand.domain</code>.
                </InfoCard>
              }
            />
          </div>
        </SectionCard>

        <div className="min-w-0 xl:col-span-5">
          <ChartCard title="Hoa hồng theo tháng" description="12 tháng gần nhất." height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissionSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#667085" }}
                  tickFormatter={(v: number) => formatCompact(v)}
                  width={52}
                />
                <RTooltip
                  formatter={(v: number) => [formatMoney(v), "Hoa hồng"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6EAF0", fontSize: 12 }}
                />
                <Bar dataKey="commission" fill="#D99A16" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <SectionCard title="Bậc hoa hồng" description="Tỉ lệ áp dụng theo tổng doanh số giới thiệu." className="min-w-0 xl:col-span-6">
          <ul className="space-y-2">
            {commissionTiers.map((t) => (
              <li
                key={t.name}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-card border p-3",
                  t.current ? "border-lv-gold-500 bg-lv-gold-50" : "border-lv-border",
                )}
              >
                <div>
                  <p className="flex items-center gap-2 text-body-strong text-lv-text">
                    {t.name}
                    {t.current ? <Badge tone="gold">Đang áp dụng</Badge> : null}
                  </p>
                  <p className="text-small text-lv-muted">{t.requirement}</p>
                </div>
                <span className="text-h3 text-lv-gold-700">{t.rate}</span>
              </li>
            ))}
          </ul>
          <InfoCard title="Chính sách hoa hồng chưa chốt" tone="warning" icon={<IconTrophy size={16} />}>
            Tỉ lệ hiển thị là cấu hình DEMO. Gap: <code className="text-small">affiliate.commissionPolicy</code>.
          </InfoCard>
        </SectionCard>

        <SectionCard title="Yêu cầu rút hoa hồng" description="Số dư hoa hồng khả dụng sẽ được đối soát trước khi chi trả." className="min-w-0 xl:col-span-6">
          <form
            onSubmit={handleSubmit(() =>
              toast.push({
                tone: "success",
                title: "Đã gửi yêu cầu rút (DEMO)",
                description: "Không có giao dịch tiền thật nào được thực hiện.",
              }),
            )}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="w-amount" required hint={`khả dụng ${formatMoney(affiliateStats.totalCommission)}`}>
                Số tiền rút
              </Label>
              <Input
                id="w-amount"
                type="number"
                step={50_000}
                tone={errors.amount ? "invalid" : "default"}
                {...register("amount")}
              />
              <FieldMessage>{errors.amount?.message}</FieldMessage>
            </div>
            <div>
              <Label htmlFor="w-method" required>
                Phương thức nhận
              </Label>
              <Select id="w-method" {...register("method")}>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="wallet">Ví điện tử</option>
                <option value="balance">Cộng vào số dư dịch vụ</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="w-account" required>
                Số tài khoản nhận
              </Label>
              <Input
                id="w-account"
                placeholder="Số tài khoản / số ví"
                tone={errors.account ? "invalid" : "default"}
                {...register("account")}
              />
              <FieldMessage>{errors.account?.message}</FieldMessage>
            </div>
            <Button type="submit" block>
              Gửi yêu cầu rút
            </Button>
            <p className="text-small text-lv-muted">
              Yêu cầu được đối soát trong 1–3 ngày làm việc khi hệ thống thanh toán thật đi vào hoạt động.
            </p>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Khách hàng đã giới thiệu" description={`${referredUsers.length} người`} padded={false}>
        <DataTable
          caption="Danh sách khách hàng đã giới thiệu"
          columns={columns}
          rows={referredUsers}
          emptyTitle="Chưa có khách hàng nào"
          emptyDescription="Chia sẻ liên kết giới thiệu để bắt đầu nhận hoa hồng."
        />
      </SectionCard>
    </div>
  );
}
