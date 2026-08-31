"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconArrowDownRight,
  IconCheck,
  IconCopy,
  IconHeadset,
  IconReceipt,
  IconRefresh,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, SupportCard, InfoCard } from "@/components/blocks/Cards";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Column, DataTable } from "@/components/blocks/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { FieldMessage, Input, Label, RadioCard } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { paymentMethods } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { useCustomerAuth } from "@/lib/customer/auth";
import { formatDateTime, formatMoney } from "@/lib/utils";

/**
 * Nạp tiền qua SePay.
 *
 * Khách chọn số tiền → máy chủ tạo lệnh nạp kèm mã riêng → khách quét QR hoặc
 * chuyển khoản với mã đó → SePay bắn webhook khi tiền về → số dư cộng tự động.
 * Trang này hỏi lại trạng thái mỗi 5 giây trong lúc chờ.
 */

const quickAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];
const MIN_AMOUNT = 10_000;

interface Deposit {
  id: string;
  code: string;
  amount: number;
  status: "pending" | "success" | "canceled";
  method: string;
  createdAt: string;
  paidAt?: string | null;
}

interface Transfer {
  bank: string;
  accountNumber: string;
  accountName: string;
  content: string;
  amount: number;
  qrUrl: string | null;
}

export function DepositView() {
  const toast = useToast();
  const { session, ready } = useCustomerAuth();

  const [methodId, setMethodId] = React.useState(paymentMethods[0].id);
  const method = paymentMethods.find((m) => m.id === methodId) ?? paymentMethods[0];

  const [amount, setAmount] = React.useState(500_000);
  const [submitting, setSubmitting] = React.useState(false);
  const [transfer, setTransfer] = React.useState<Transfer | null>(null);
  const [pendingCode, setPendingCode] = React.useState<string | null>(null);

  const [deposits, setDeposits] = React.useState<Deposit[]>([]);
  const [balance, setBalance] = React.useState<number | null>(null);
  const [configError, setConfigError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    if (!session) return;
    const res = await fetch("/api/deposits")
      .then((r) => r.json())
      .catch(() => null);
    if (res?.ok) {
      setDeposits(res.deposits ?? []);
      setBalance(res.balance ?? 0);
    }
  }, [session]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  // Chờ tiền về: hỏi lại mỗi 5 giây cho tới khi lệnh chuyển sang thành công.
  React.useEffect(() => {
    if (!pendingCode) return;
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [pendingCode, refresh]);

  React.useEffect(() => {
    if (!pendingCode) return;
    const paid = deposits.find((d) => d.code === pendingCode && d.status === "success");
    if (paid) {
      setPendingCode(null);
      setTransfer(null);
      toast.push({
        tone: "success",
        title: `Đã nhận ${formatMoney(paid.amount)}`,
        description: "Số dư của bạn đã được cộng.",
      });
    }
  }, [deposits, pendingCode, toast]);

  const amountError = amount < MIN_AMOUNT ? `Nạp tối thiểu ${formatMoney(MIN_AMOUNT)}.` : null;

  async function createDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (amountError) return;

    setSubmitting(true);
    setConfigError(null);
    const res = await fetch("/api/deposits", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount, method: method.name }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setSubmitting(false);

    if (!res.ok) {
      setConfigError(String(res.error));
      toast.push({ tone: "error", title: "Không tạo được lệnh nạp", description: String(res.error) });
      return;
    }

    setTransfer(res.transfer);
    setPendingCode(res.deposit.code);
    void refresh();
  }

  function copy(value: string, label: string) {
    navigator.clipboard
      ?.writeText(value)
      .then(() => toast.push({ tone: "success", title: `Đã sao chép ${label}` }))
      .catch(() => toast.push({ tone: "warning", title: "Trình duyệt không cho sao chép" }));
  }

  const columns: Column<Deposit>[] = [
    { key: "code", header: "Mã lệnh", cell: (d) => <span className="lv-price text-body-strong text-lv-text">{d.code}</span> },
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
          <Badge tone="success">Đã nhận</Badge>
        ) : d.status === "pending" ? (
          <Badge tone="warning">Chờ chuyển khoản</Badge>
        ) : (
          <Badge tone="danger">Đã huỷ</Badge>
        ),
    },
    { key: "createdAt", header: "Thời gian", align: "right", cell: (d) => formatDateTime(d.createdAt) },
  ];

  // Chưa đăng nhập thì không có gì để nạp vào.
  if (ready && !session) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Nạp tiền"
          description="Nạp số dư để sử dụng dịch vụ và mua tài khoản premium."
          breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Nạp tiền" }]}
        />
        <SectionCard title="Cần đăng nhập">
          <p className="text-body text-lv-navy-700">
            Số dư gắn với tài khoản của bạn, nên phải đăng nhập trước khi tạo lệnh nạp.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/login?next=/deposit">Đăng nhập</LinkButton>
            <LinkButton href="/register?next=/deposit" variant="secondary">
              Tạo tài khoản
            </LinkButton>
          </div>
        </SectionCard>
      </div>
    );
  }

  const totalIn = deposits.filter((d) => d.status === "success").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nạp tiền"
        description="Chuyển khoản đúng nội dung, số dư cộng tự động trong ít phút."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Nạp tiền" }]}
        action={
          <Button variant="secondary" icon={<IconRefresh size={17} />} onClick={() => void refresh()}>
            Làm mới
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Số dư hiện tại"
          value={balance === null ? "…" : formatMoney(balance)}
          tone="gold"
          icon={<IconWallet size={20} />}
        />
        <StatCard label="Tổng đã nạp" value={formatMoney(totalIn)} tone="navy" icon={<IconArrowDownRight size={20} />} />
        <StatCard
          label="Lệnh đang chờ"
          value={String(deposits.filter((d) => d.status === "pending").length)}
          suffix="lệnh"
          tone="info"
          icon={<IconReceipt size={20} />}
        />
        <StatCard
          label="Lệnh đã nhận"
          value={String(deposits.filter((d) => d.status === "success").length)}
          suffix="lệnh"
          tone="success"
          icon={<IconCheck size={20} />}
        />
      </div>

      {configError ? (
        <InfoCard title="Chưa nạp được" tone="danger" icon={<IconAlertTriangle size={16} />}>
          {configError}
        </InfoCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          {transfer ? (
            <SectionCard
              title="Chuyển khoản để hoàn tất"
              description="Quét mã hoặc chuyển thủ công. Giữ nguyên nội dung để hệ thống tự khớp."
              action={<Badge tone="warning">Đang chờ tiền về</Badge>}
            >
              <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                {transfer.qrUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={transfer.qrUrl}
                    alt={`Mã QR chuyển khoản ${formatMoney(transfer.amount)}`}
                    className="h-[200px] w-[200px] rounded-card border border-lv-border bg-white object-contain"
                  />
                ) : null}

                <div className="min-w-0 space-y-2">
                  <TransferRow label="Ngân hàng" value={transfer.bank} />
                  <TransferRow label="Số tài khoản" value={transfer.accountNumber} onCopy={copy} />
                  {transfer.accountName ? <TransferRow label="Chủ tài khoản" value={transfer.accountName} /> : null}
                  <TransferRow label="Số tiền" value={formatMoney(transfer.amount)} />
                  <TransferRow label="Nội dung chuyển khoản" value={transfer.content} onCopy={copy} highlight />
                </div>
              </div>

              <InfoCard title="Nội dung phải giữ nguyên" tone="warning" icon={<IconAlertTriangle size={16} />}>
                Thiếu hoặc sai mã <strong>{transfer.content}</strong> thì hệ thống không biết tiền của ai và số dư sẽ
                không tự cộng. Trang này tự kiểm tra mỗi vài giây, chuyển xong cứ để mở.
              </InfoCard>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => void refresh()} icon={<IconRefresh size={16} />}>
                  Kiểm tra ngay
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTransfer(null);
                    setPendingCode(null);
                  }}
                >
                  Tạo lệnh khác
                </Button>
              </div>
            </SectionCard>
          ) : (
            <>
              <SectionCard title="Chọn phương thức nạp" description="Tiền về tài khoản nào cũng được cộng tự động.">
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

              <SectionCard title="Số tiền nạp" description="Chọn nhanh hoặc nhập số bất kỳ.">
                <form onSubmit={createDeposit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount" required hint={`tối thiểu ${formatMoney(MIN_AMOUNT)}`}>
                      Số tiền
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      inputMode="numeric"
                      step={10_000}
                      min={MIN_AMOUNT}
                      value={amount}
                      onChange={(e) => setAmount(Math.round(Number(e.target.value) || 0))}
                      tone={amountError ? "invalid" : "default"}
                      aria-invalid={!!amountError}
                    />
                    <FieldMessage>{amountError}</FieldMessage>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickAmounts.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAmount(a)}
                          className="rounded-pill border border-lv-border px-3 py-1 text-small-strong text-lv-navy-700 transition-colors duration-button hover:border-lv-border-gold hover:bg-lv-gold-50"
                        >
                          {formatMoney(a)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-card border border-lv-border-gold bg-lv-gold-50 px-3 py-2">
                    <span className="text-small text-lv-gold-700">Số dư nhận được</span>
                    <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(amount)}</span>
                  </div>

                  <Button type="submit" size="lg" block loading={submitting} disabled={!!amountError || !method.available}>
                    {submitting ? "Đang tạo lệnh…" : "Lấy thông tin chuyển khoản"}
                  </Button>
                </form>
              </SectionCard>
            </>
          )}

          <SectionCard title="Lệnh nạp gần đây" padded={false}>
            <DataTable
              caption="Danh sách lệnh nạp gần đây"
              columns={columns}
              rows={deposits}
              rowKey={(d) => d.id}
              emptyTitle="Chưa có lệnh nạp nào"
              emptyDescription="Tạo lệnh nạp ở trên để lấy thông tin chuyển khoản."
            />
          </SectionCard>
        </div>

        <aside className="min-w-0 space-y-4 xl:col-span-4">
          <InfoCard title="Lưu ý khi nạp tiền" tone="warning" icon={<IconAlertTriangle size={16} />}>
            <ul className="space-y-1.5">
              <li>· Chuyển đúng nội dung để hệ thống tự đối soát.</li>
              <li>· Mỗi lệnh nạp có mã riêng, không dùng lại mã của lệnh cũ.</li>
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

          <div className="rounded-card border border-lv-border bg-lv-surface p-4 text-small text-lv-muted">
            <p className="text-card-title text-lv-text">Bao lâu thì nhận được?</p>
            <p className="mt-2">
              Tiền về tài khoản là hệ thống cộng ngay, thường trong vòng một phút. Nếu quá 10 phút chưa thấy, gửi
              yêu cầu đối soát kèm mã lệnh.
            </p>
            <p className="mt-2">
              Cần giúp gấp? <Link href="/history" className="font-semibold text-lv-gold-700 hover:underline">Xem lịch sử hoạt động</Link>{" "}
              để đối chiếu.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TransferRow({
  label,
  value,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  onCopy?: (value: string, label: string) => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-control border px-3 py-2 ${
        highlight ? "border-lv-border-gold bg-lv-gold-50" : "border-lv-border bg-lv-bg"
      }`}
    >
      <span className="shrink-0 text-small text-lv-muted">{label}</span>
      <span className="flex min-w-0 items-center gap-2">
        <span className={`lv-price truncate text-body-strong ${highlight ? "text-lv-gold-700" : "text-lv-text"}`}>
          {value}
        </span>
        {onCopy ? (
          <button
            type="button"
            onClick={() => onCopy(value, label.toLowerCase())}
            aria-label={`Sao chép ${label}`}
            className="shrink-0 rounded-control p-1 text-lv-muted transition-colors duration-button hover:bg-lv-surface hover:text-lv-gold-700"
          >
            <IconCopy size={16} />
          </button>
        ) : null}
      </span>
    </div>
  );
}
