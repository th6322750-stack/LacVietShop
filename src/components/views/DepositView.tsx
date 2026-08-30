"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconCheck,
  IconHeadset,
  IconReceipt,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard, DemoNotice, InfoCard } from "@/components/blocks/Cards";
import { QRCard } from "@/components/blocks/Media";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Column, DataTable } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, RadioCard, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { account, paymentMethods, recentDeposits } from "@/lib/demo/data";
import { commerceAdapter, demoBrand, demoPaymentNotice } from "@/lib/demo/config";
import { formatDateTime, formatMoney } from "@/lib/utils";

const quickAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

const schema = z.object({
  amount: z.coerce.number().min(10_000, "Số tiền tối thiểu 10.000 ₫.").max(500_000_000, "Số tiền quá lớn."),
  reference: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
});

type FormValues = z.input<typeof schema>;
type Deposit = (typeof recentDeposits)[number];

export function DepositView() {
  const toast = useToast();
  const [methodId, setMethodId] = React.useState(paymentMethods[0].id);
  const [submitting, setSubmitting] = React.useState(false);
  const method = paymentMethods.find((m) => m.id === methodId) ?? paymentMethods[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 500_000, reference: "", note: "" },
    mode: "onBlur",
  });

  const amount = Number(watch("amount") || 0);
  const fee = method.kind === "ewallet" ? Math.round(amount * 0.01) : 0;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await commerceAdapter.submitDeposit({ methodId, amount: Number(values.amount) });
    setSubmitting(false);
    if (!res.ok) {
      toast.push({ tone: "error", title: "Không tạo được lệnh nạp", description: res.error });
      return;
    }
    toast.push({
      tone: "success",
      title: `Đã ghi nhận lệnh nạp ${res.reference}`,
      description: "Đây là lệnh mô phỏng. Không có giao dịch tiền thật nào được thực hiện.",
    });
  }

  const columns: Column<Deposit & { id: string }>[] = [
    { key: "id", header: "Mã lệnh", cell: (d) => <span className="text-body-strong text-lv-text">{d.id}</span> },
    { key: "method", header: "Phương thức", cell: (d) => d.method },
    {
      key: "amount",
      header: "Số tiền",
      align: "right",
      cell: (d) => <span className="lv-price text-body-strong text-lv-text">{formatMoney(d.amount)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (d) =>
        d.status === "success" ? (
          <Badge tone="success">Thành công</Badge>
        ) : d.status === "pending" ? (
          <Badge tone="warning">Đang xử lý</Badge>
        ) : (
          <Badge tone="danger">Thất bại</Badge>
        ),
    },
    { key: "createdAt", header: "Thời gian", align: "right", cell: (d) => formatDateTime(d.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nạp tiền"
        description="Nạp số dư để sử dụng dịch vụ và mua tài khoản premium."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Nạp tiền" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Số dư hiện tại" value={formatMoney(account.balance)} tone="gold" icon={<IconWallet size={20} />} />
        <StatCard label="Tổng đã nạp" value={formatMoney(account.totalDeposited)} tone="navy" icon={<IconArrowDownRight size={20} />} />
        <StatCard label="Tổng đã chi" value={formatMoney(account.totalSpent)} tone="info" icon={<IconReceipt size={20} />} />
        <StatCard label="Số dư sau chi tiêu" value={formatMoney(account.totalDeposited - account.totalSpent)} tone="success" icon={<IconCheck size={20} />} hint="Tổng nạp trừ tổng chi" />
      </div>

      <DemoNotice title={demoPaymentNotice.headline}>{demoPaymentNotice.detail}</DemoNotice>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <SectionCard title="Chọn phương thức nạp" description="Phí và thời gian xử lý khác nhau theo từng cổng.">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Phương thức thanh toán">
              {paymentMethods.map((m) => (
                <RadioCard
                  key={m.id}
                  checked={m.id === methodId}
                  onSelect={() => setMethodId(m.id)}
                  disabled={!m.available}
                  title={
                    <span className="flex items-center gap-2">
                      <AssetImage assetKey={m.assetKey} className="h-6 w-10" rounded="control" />
                      {m.name}
                    </span>
                  }
                  subtitle={`${m.detail} · ${m.processingTime}`}
                  right={
                    m.available ? (
                      <span className="text-small text-lv-muted">{m.feeNote}</span>
                    ) : (
                      <Badge tone="neutral">Tạm dừng</Badge>
                    )
                  }
                />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Thông tin chuyển khoản" description={`${method.name} · ${method.processingTime}`}>
            <QRCard
              assetKey="deposit.realQr"
              title="Mã QR chuyển khoản"
              lines={[
                { label: "Ngân hàng / Ví", value: method.name },
                { label: "Chủ tài khoản", value: "Chưa cấu hình" },
                { label: "Số tài khoản", value: "Chưa cấu hình" },
                { label: "Nội dung chuyển khoản", value: `LV ${account.username}`, copyable: true },
              ]}
              notice={
                <InfoCard title="Chưa có tài khoản nhận tiền chính thức" tone="warning" icon={<IconAlertTriangle size={16} />}>
                  Thông tin ở trên là chỗ dành sẵn cho cấu hình thật. Không chuyển tiền theo nội dung này.
                  Gap: <code className="text-small">payment.receivingAccount</code>,{" "}
                  <code className="text-small">payment.gateway</code>.
                </InfoCard>
              }
            />
          </SectionCard>

          <SectionCard title="Tạo lệnh nạp" description="Nhập số tiền và mã giao dịch để đối soát.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="amount" required>
                  Số tiền nạp
                </Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  step={10_000}
                  tone={errors.amount ? "invalid" : "default"}
                  aria-invalid={!!errors.amount}
                  {...register("amount")}
                />
                <FieldMessage>{errors.amount?.message}</FieldMessage>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickAmounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setValue("amount", a, { shouldValidate: true })}
                      className="rounded-pill border border-lv-border px-3 py-1 text-small-strong text-lv-navy-700 transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50"
                    >
                      {formatMoney(a)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reference">Mã giao dịch / nội dung đã chuyển</Label>
                <Input id="reference" placeholder="Ví dụ: FT26083012345678" {...register("reference")} />
              </div>

              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Thông tin thêm cho bộ phận đối soát" {...register("note")} />
              </div>

              <div className="rounded-card border border-lv-border bg-lv-bg p-4">
                <div className="flex items-center justify-between text-small text-lv-muted">
                  <span>Số tiền nạp</span>
                  <span className="lv-price text-body-strong text-lv-text">{formatMoney(amount)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-small text-lv-muted">
                  <span>Phí cổng thanh toán</span>
                  <span className="lv-price">{fee > 0 ? `- ${formatMoney(fee)}` : "Miễn phí"}</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-lv-border pt-2">
                  <span className="text-body-strong text-lv-text">Số dư nhận được</span>
                  <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(Math.max(0, amount - fee))}</span>
                </div>
              </div>

              <Button type="submit" size="lg" block loading={submitting} disabled={!method.available}>
                {submitting ? "Đang ghi nhận…" : "Tạo lệnh nạp (DEMO)"}
              </Button>
            </form>
          </SectionCard>

          <SectionCard title="Lệnh nạp gần đây" padded={false}>
            <DataTable
              caption="Danh sách lệnh nạp gần đây"
              columns={columns}
              rows={recentDeposits.map((d) => ({ ...d }))}
              emptyTitle="Chưa có lệnh nạp nào"
            />
          </SectionCard>
        </div>

        <aside className="min-w-0 space-y-4 xl:col-span-4">
          <InfoCard title="Lưu ý khi nạp tiền" tone="warning" icon={<IconAlertTriangle size={16} />}>
            <ul className="space-y-1.5">
              <li>· Chuyển đúng nội dung để hệ thống tự đối soát.</li>
              <li>· Nạp sai nội dung cần liên hệ hỗ trợ kèm ảnh chụp giao dịch.</li>
              <li>· Không chuyển tiền cho bất kỳ tài khoản cá nhân nào tự xưng là nhân viên.</li>
            </ul>
          </InfoCard>

          <SupportCard
            title="Hỗ trợ nạp tiền"
            description={`Khung giờ trực: ${demoBrand.supportHours}.`}
            channels={demoBrand.supportChannels.map((c) => ({ label: c.label, value: c.value }))}
            action={
              <Button variant="secondary" block icon={<IconHeadset size={16} />}>
                Gửi yêu cầu đối soát
              </Button>
            }
          />
        </aside>
      </div>
    </div>
  );
}
