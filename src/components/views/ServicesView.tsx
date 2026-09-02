"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconAlertTriangle,
  IconCheck,
  IconClockHour4,
  IconInfoCircle,
  IconRefresh,
  IconSearch,
  IconServer2,
  IconShieldCheck,
  IconTicket,
  IconWallet,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, InfoCard } from "@/components/blocks/Cards";
import { OrderSummaryRow, PlatformTile } from "@/components/blocks/Commerce";
import { AssetImage } from "@/components/blocks/AssetImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldMessage, Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useCustomerAuth } from "@/lib/customer/auth";
import { cn, formatMoney, formatNumber, formatUnitPrice } from "@/lib/utils";
import type { Platform, PlatformService, ServiceServer } from "@/types";

/** Bản nhẹ gửi xuống trình duyệt: dịch vụ giữ SỐ máy chủ, không kèm mảng máy chủ. */
type LightService = Omit<PlatformService, "servers"> & { serverCount: number };
type LightPlatform = Omit<Platform, "services"> & { services: LightService[] };

const reactions = [
  { id: "like", label: "Thích" },
  { id: "love", label: "Yêu thích" },
  { id: "care", label: "Thương thương" },
  { id: "haha", label: "Haha" },
  { id: "wow", label: "Wow" },
  { id: "sad", label: "Buồn" },
];

const schema = z.object({
  target: z.string().min(6, "Nhập liên kết hoặc ID hợp lệ."),
  quantity: z.coerce.number().int("Số lượng phải là số nguyên.").positive("Số lượng phải lớn hơn 0."),
  note: z.string().max(300, "Ghi chú tối đa 300 ký tự.").optional(),
  reaction: z.string().optional(),
});

type FormValues = z.input<typeof schema>;

/** Chưa có cơ chế xếp bậc khách hàng nên mọi tài khoản dùng bậc đầu. */
const tierIndex = 0;

function priceFor(server: ServiceServer) {
  return server.pricesByTier[tierIndex] ?? server.pricePerUnit;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function ServicesView({
  initialPlatform,
  platforms,
  totalServerCount,
  catalogSource,
  catalogError,
}: {
  initialPlatform?: string;
  /** Danh mục NHẸ lấy phía server: có nền tảng + dịch vụ, máy chủ tải riêng. */
  platforms: LightPlatform[];
  /** Tổng số máy chủ toàn danh mục (để hiện, khỏi phải kèm mảng máy chủ). */
  totalServerCount: number;
  catalogSource: "api" | "fallback";
  catalogError?: string;
}) {
  const toast = useToast();
  // Số dư thật của phiên; chưa đăng nhập thì coi như 0 để không mời chào ảo.
  const { session, refresh } = useCustomerAuth();
  const balance = session?.balance ?? 0;
  const [region, setRegion] = React.useState<"vn" | "global">(
    platforms.find((p) => p.id === initialPlatform)?.region ?? "vn",
  );
  const regionPlatforms = platforms.filter((p) => p.region === region);

  const [platformQuery, setPlatformQuery] = React.useState("");
  const [platformId, setPlatformId] = React.useState(
    initialPlatform && platforms.some((p) => p.id === initialPlatform) ? initialPlatform : regionPlatforms[0].id,
  );
  const platform = platforms.find((p) => p.id === platformId) ?? regionPlatforms[0];

  const [serviceId, setServiceId] = React.useState(platform.services[0].id);
  const service = platform.services.find((s) => s.id === serviceId) ?? platform.services[0];

  // Máy chủ tải theo (nền tảng, dịch vụ) khi khách chọn; nhớ lại để đổi qua đổi
  // lại khỏi gọi mạng nhiều lần. servers === null nghĩa là đang tải.
  const [serversByKey, setServersByKey] = React.useState<Record<string, ServiceServer[]>>({});
  const [serverId, setServerId] = React.useState<string | null>(null);
  const svKey = `${platformId}/${serviceId}`;
  const servers = serversByKey[svKey] ?? null;
  const server = servers?.find((s) => s.id === serverId) ?? servers?.[0] ?? null;
  const serversLoading = servers === null;

  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ code: string } | null>(null);

  const shownPlatforms = React.useMemo(() => {
    const q = normalize(platformQuery.trim());
    if (!q) return regionPlatforms;
    return regionPlatforms.filter((p) => normalize(p.name).includes(q));
  }, [regionPlatforms, platformQuery]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { target: "", quantity: 0, note: "", reaction: "like" },
    mode: "onBlur",
  });

  // Tải máy chủ cho dịch vụ đang chọn — mỗi dịch vụ chỉ gọi một lần.
  React.useEffect(() => {
    if (serversByKey[svKey]) return;
    let alive = true;
    fetch(`/api/thatim/servers?platform=${encodeURIComponent(platformId)}&service=${encodeURIComponent(serviceId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setServersByKey((prev) => ({ ...prev, [svKey]: d.ok ? (d.servers ?? []) : [] }));
      })
      .catch(() => {
        if (alive) setServersByKey((prev) => ({ ...prev, [svKey]: [] }));
      });
    return () => {
      alive = false;
    };
  }, [svKey, platformId, serviceId, serversByKey]);

  // Máy chủ vừa tải xong / vừa đổi dịch vụ: chọn máy chủ đầu và đặt số lượng mặc định.
  React.useEffect(() => {
    if (!servers || servers.length === 0) return;
    if (!servers.some((s) => s.id === serverId)) {
      setServerId(servers[0].id);
      setValue("quantity", servers[0].min);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servers, serverId]);

  // Đổi nền tảng/dịch vụ thì đưa lựa chọn con về mặc định hợp lệ.
  function selectPlatform(id: string) {
    const next = platforms.find((p) => p.id === id);
    if (!next) return;
    setPlatformId(id);
    setServiceId(next.services[0].id);
    setServerId(null);
  }

  function selectService(id: string) {
    setServiceId(id);
    setServerId(null);
  }

  function selectServer(next: ServiceServer) {
    setServerId(next.id);
    setValue("quantity", next.min);
  }

  const unitPrice = server ? priceFor(server) : 0;
  const quantity = Number(watch("quantity") || 0);
  const subtotal = quantity * unitPrice;
  const total = Math.max(0, Math.round(subtotal));
  const notEnoughBalance = total > balance;
  const quantityOutOfRange = !!server && quantity > 0 && (quantity < server.min || quantity > server.max);

  async function onSubmit(values: FormValues) {
    if (!server || !server.available) return;
    if (quantityOutOfRange) {
      toast.push({
        tone: "warning",
        title: "Số lượng ngoài giới hạn",
        description: `Máy chủ này nhận từ ${formatNumber(server.min)} đến ${formatNumber(server.max)}.`,
      });
      return;
    }
    // Chưa đăng nhập thì báo đúng việc cần làm, chứ báo "số dư không đủ" cho
    // người chưa có tài khoản thì khó hiểu.
    if (!session) {
      toast.push({
        tone: "warning",
        title: "Đăng nhập để tạo đơn",
        description: "Đơn gắn với tài khoản để bạn theo dõi tiến độ và được hỗ trợ.",
      });
      return;
    }
    if (notEnoughBalance) {
      toast.push({
        tone: "error",
        title: "Số dư không đủ",
        description: "Nạp thêm tiền trước khi tạo đơn.",
      });
      return;
    }

    setSubmitting(true);

    // Máy chủ tự tính lại giá và trừ số dư; trình duyệt chỉ gửi mã máy chủ,
    // liên kết và số lượng. Không gửi giá — gửi giá là mở cửa cho người sửa.
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serverId: server.id,
        link: values.target,
        quantity: Number(values.quantity),
        note: values.note,
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Không gọi được máy chủ." }));
    setSubmitting(false);

    if (!res.ok) {
      toast.push({ tone: "error", title: "Chưa tạo được đơn", description: String(res.error) });
      return;
    }

    await refresh();
    setResult({ code: String(res.order.id) });
    toast.push({
      tone: "success",
      title: `Đã tạo đơn ${res.order.id}`,
      description: res.queued
        ? "Đơn đã nhận và đang xếp hàng chờ xử lý. Theo dõi ở trang Tiến độ đơn hàng."
        : "Đơn đang chạy. Theo dõi ở trang Tiến độ đơn hàng.",
    });
  }

  const serviceCount = platform.services.length;
  const serverCount = platform.services.reduce((s, x) => s + x.serverCount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đặt dịch vụ"
        description="Chọn nền tảng, dịch vụ và máy chủ phù hợp rồi tạo đơn."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "Dịch vụ / Tạo đơn" }]}
      />

      {catalogSource === "api" ? (
        <p className="flex flex-wrap items-center gap-2 text-small text-lv-muted">
          <Badge tone="success">Bảng giá trực tiếp</Badge>
          Danh mục và đơn giá lấy thẳng từ nhà cung cấp · {platforms.length} nền tảng ·{" "}
          {platforms.reduce((s, p) => s + p.services.length, 0)} nhóm dịch vụ ·{" "}
          {totalServerCount} máy chủ
        </p>
      ) : (
        <div>
          <InfoCard title="Đang dùng bảng giá dự phòng" tone="warning" icon={<IconAlertTriangle size={16} />}>
            Chưa lấy được danh mục trực tiếp từ nhà cung cấp{catalogError ? ` (${catalogError})` : ""}. Bảng dưới
            đây dựng từ bản chụp trang của họ, đơn giá có thể đã cũ.
          </InfoCard>
        </div>
      )}

      <Tabs
        ariaLabel="Khu vực dịch vụ"
        items={[
          { id: "vn", label: "Dịch vụ Việt Nam", count: platforms.filter((p) => p.region === "vn").length },
          { id: "global", label: "Dịch vụ quốc tế", count: platforms.filter((p) => p.region === "global").length },
        ]}
        value={region}
        onChange={(id) => {
          const next = id as "vn" | "global";
          setRegion(next);
          setPlatformQuery("");
          const first = platforms.find((p) => p.region === next);
          if (first) selectPlatform(first.id);
        }}
      />

      <SectionCard
        title="Chọn nền tảng"
        description={`${regionPlatforms.length} nền tảng · mỗi nền tảng có nhóm dịch vụ và máy chủ riêng.`}
      >
        <div className="mb-3 max-w-sm">
          <Input
            id="platform-search"
            type="search"
            aria-label="Tìm nền tảng"
            placeholder="Tìm nền tảng…"
            value={platformQuery}
            onChange={(e) => setPlatformQuery(e.target.value)}
            prefix={<IconSearch size={16} />}
          />
        </div>

        {shownPlatforms.length === 0 ? (
          <p className="py-6 text-center text-small text-lv-muted">Không có nền tảng nào khớp “{platformQuery}”.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
            {shownPlatforms.map((p) => (
              <PlatformTile
                key={p.id}
                name={p.name}
                assetKey={p.assetKey}
                selected={p.id === platformId}
                onClick={() => selectPlatform(p.id)}
                count={p.services.length}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 xl:grid-cols-12">
        {/* Cột trái ~8/12 */}
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <SectionCard
            title="Tạo đơn hàng"
            description={`${platform.name} · ${serviceCount} dịch vụ · ${serverCount} máy chủ`}
          >
            <div>
              <Label htmlFor="service">Chọn dịch vụ</Label>
              <Select id="service" value={serviceId} onChange={(e) => selectService(e.target.value)}>
                {platform.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            {serversLoading ? (
              <div className="mt-6 flex items-center justify-center gap-2 py-12 text-small text-lv-muted">
                <IconRefresh size={16} className="animate-spin" /> Đang tải máy chủ…
              </div>
            ) : !server ? (
              <p className="mt-6 py-10 text-center text-small text-lv-muted">Dịch vụ này chưa có máy chủ nào.</p>
            ) : (
              <>
            {/* Bộ chọn máy chủ dựng theo bảng máy chủ bên nhà cung cấp:
                số thứ tự, tên đầy đủ, MIN/MAX và giá theo bậc thành viên. */}
            <div className="mt-4">
              <Label>
                Chọn máy chủ
              </Label>
              <div
                role="radiogroup"
                aria-label="Danh sách máy chủ"
                className="max-h-[26rem] space-y-2 overflow-y-auto rounded-card border border-lv-border bg-lv-bg p-2"
              >
                {(servers ?? []).map((s) => (
                  <ServerOption
                    key={s.id}
                    server={s}
                    selected={s.id === server.id}
                    onSelect={() => selectServer(s)}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-small text-lv-muted">
                {catalogSource === "api"
                  ? "Mỗi máy chủ là một nguồn chạy khác nhau; chọn theo tốc độ và mức giá phù hợp."
                  : "Máy chủ gắn nhãn DEMO chưa có số liệu từ nhà cung cấp, sẽ cập nhật khi đấu API."}
              </p>
            </div>

            {/* Thông số máy chủ — một dải gọn, chỉ hiện trường mà nguồn có ghi */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-card border border-lv-border bg-lv-bg px-3 py-2 text-small">
              <ServerFact icon={<IconWallet size={14} />} label="Đơn giá" value={`${formatUnitPrice(unitPrice)}/tương tác`} />
              <ServerFact
                icon={<IconInfoCircle size={14} />}
                label="Giới hạn"
                value={`${formatNumber(server.min)} – ${formatNumber(server.max)}`}
              />
              {server.speed ? <ServerFact icon={<IconRefresh size={14} />} label="Tốc độ" value={server.speed} /> : null}
              {server.refill ? (
                <ServerFact icon={<IconShieldCheck size={14} />} label="Bảo hành" value={server.refill} />
              ) : null}
              {server.sourceNote ? (
                <ServerFact icon={<IconServer2 size={14} />} label="Nguồn" value={server.sourceNote} />
              ) : null}
              {server.startTime ? (
                <ServerFact icon={<IconClockHour4 size={14} />} label="Bắt đầu" value={server.startTime} />
              ) : null}
              {server.tags.map((t) => (
                <Badge key={t} tone="gold">
                  {t}
                </Badge>
              ))}
              {!server.available ? <Badge tone="danger">Đang bảo trì</Badge> : null}
            </div>

            {/* Cảnh báo pháp lý — luôn giữ màu đỏ theo §8 */}
            <div className="mt-4">
              <InfoCard title="Nghiêm cấm hành vi vi phạm pháp luật" tone="danger" icon={<IconAlertTriangle size={16} />}>
                Không sử dụng dịch vụ cho mục đích lừa đảo, bôi nhọ, chính trị, đồi truỵ hoặc lôi kéo đám
                đông. Tài khoản vi phạm bị khoá vĩnh viễn và người đặt đơn chịu trách nhiệm trước pháp luật.
              </InfoCard>
            </div>

            <div className="mt-4 grid gap-4">
              <div>
                <Label htmlFor="target" required>
                  Liên kết hoặc ID mục tiêu
                </Label>
                <Input
                  id="target"
                  placeholder="https://facebook.com/... hoặc ID bài viết"
                  tone={errors.target ? "invalid" : "default"}
                  aria-invalid={!!errors.target}
                  {...register("target")}
                />
                <FieldMessage>{errors.target?.message}</FieldMessage>
              </div>

              {server.supportsReaction ? (
                <div>
                  <Label>Loại cảm xúc</Label>
                  <div className="flex flex-wrap gap-2">
                    {reactions.map((r) => {
                      const active = watch("reaction") === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setValue("reaction", r.id)}
                          aria-pressed={active}
                          className={cn(
                            "rounded-pill border px-3 py-1.5 text-small-strong transition-colors duration-button",
                            active
                              ? "border-lv-gold-500 bg-lv-gold-50 text-lv-gold-700"
                              : "border-lv-border text-lv-navy-700 hover:border-lv-border-gold",
                          )}
                        >
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="quantity" required hint={`${formatNumber(server.min)} – ${formatNumber(server.max)}`}>
                    Số lượng
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    inputMode="numeric"
                    min={server.min}
                    max={server.max}
                    tone={errors.quantity || quantityOutOfRange ? "invalid" : "default"}
                    aria-invalid={!!errors.quantity || quantityOutOfRange}
                    {...register("quantity")}
                  />
                  <FieldMessage>
                    {errors.quantity?.message ??
                      (quantityOutOfRange
                        ? `Máy chủ này chỉ nhận từ ${formatNumber(server.min)} đến ${formatNumber(server.max)}.`
                        : undefined)}
                  </FieldMessage>
                </div>
              </div>

              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea id="note" placeholder="Yêu cầu thêm cho đơn hàng (không bắt buộc)" {...register("note")} />
                <FieldMessage>{errors.note?.message}</FieldMessage>
              </div>
            </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* Cột phải ~4/12, dính khi cuộn */}
        <aside className="min-w-0 space-y-4 xl:col-span-4">
          <div className="xl:sticky xl:top-[88px]">
            <SectionCard title="Thông tin đơn hàng">
              <div className="flex items-center gap-3 rounded-card border border-lv-border bg-lv-bg p-3">
                <AssetImage assetKey={platform.assetKey} className="h-10 w-10" rounded="control" />
                <div className="min-w-0">
                  <p className="truncate text-body-strong text-lv-text">{platform.name}</p>
                  <p className="truncate text-small text-lv-muted">{service.name}</p>
                </div>
              </div>

              {server ? (
                <div className="mt-3 divide-y divide-lv-border">
                  <OrderSummaryRow label="Máy chủ" value={`Máy chủ #${server.index}`} />
                  <OrderSummaryRow label="Đơn giá" value={formatUnitPrice(unitPrice)} />
                  <OrderSummaryRow label="Số lượng" value={formatNumber(quantity)} />
                  <OrderSummaryRow label="Tạm tính" value={formatMoney(subtotal)} />
                  <OrderSummaryRow label="Tổng thanh toán" value={formatMoney(total)} strong tone="gold" />
                </div>
              ) : (
                <p className="mt-3 py-4 text-center text-small text-lv-muted">Đang tải máy chủ…</p>
              )}

              <div className="mt-3 flex items-center justify-between rounded-card border border-lv-border-gold bg-lv-gold-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-small text-lv-gold-700">
                  <IconWallet size={15} /> Số dư khả dụng
                </span>
                <span className="lv-price text-body-strong text-lv-gold-700">{formatMoney(balance)}</span>
              </div>

              {notEnoughBalance ? (
                <p className="mt-2 text-small text-lv-danger" role="alert">
                  Số dư không đủ cho đơn này. Vui lòng nạp thêm.
                </p>
              ) : null}

              <Button
                type="submit"
                block
                size="lg"
                className="mt-4"
                loading={submitting}
                disabled={!server || !server.available || total <= 0}
                icon={<IconCheck size={18} />}
              >
                {submitting ? "Đang tạo đơn…" : "Đặt hàng ngay"}
              </Button>


              {result ? (
                <div className="mt-3 rounded-card border border-lv-success/30 bg-lv-success/[0.07] p-3 text-small text-lv-navy-700">
                  <p className="text-body-strong text-lv-success">Đã tạo đơn {result.code}</p>
                  <p className="mt-1">Theo dõi tiến độ tại trang Tiến độ đơn hàng.</p>
                </div>
              ) : null}
            </SectionCard>

            <div className="mt-4 rounded-card border border-lv-border bg-lv-surface p-4">
              <p className="flex items-center gap-2 text-card-title text-lv-text">
                <IconTicket size={17} className="text-lv-gold-600" />
                Mẹo đặt đơn
              </p>
              <ul className="mt-2 space-y-1.5 text-small text-lv-muted">
                <li>· Kiểm tra liên kết ở chế độ công khai trước khi đặt.</li>
                <li>· Không đặt trùng đơn cho cùng một liên kết khi đơn cũ đang chạy.</li>
                <li>· Số lượng lớn nên chia nhiều đơn để dễ theo dõi.</li>
              </ul>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

/** Một dòng máy chủ trong danh sách chọn — bố cục theo bảng bên nhà cung cấp. */
function ServerOption({
  server,
  selected,
  onSelect,
}: {
  server: ServiceServer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      disabled={!server.available}
      className={cn(
        "flex w-full gap-3 rounded-control border p-3 text-left transition-colors duration-button",
        selected
          ? "border-lv-gold-500 bg-lv-gold-50"
          : "border-lv-border bg-lv-surface hover:border-lv-border-gold",
        !server.available && "opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-control text-small-strong",
          selected ? "bg-lv-gold-600 text-white" : "bg-lv-bg text-lv-navy-700",
        )}
      >
        {server.index}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block break-words text-body-strong text-lv-text">{server.name}</span>
        <span className="mt-0.5 block text-small text-lv-muted">
          MIN {formatNumber(server.min)} · MAX {formatNumber(server.max)}
        </span>
        {server.tags.length > 0 || server.speed ? (
          <span className="mt-1 flex flex-wrap gap-1">
            {server.speed ? (
              <Badge tone="neutral">
                {server.speed}
              </Badge>
            ) : null}
            {server.tags.slice(0, 3).map((t) => (
              <Badge key={t} tone="neutral">
                {t}
              </Badge>
            ))}
          </span>
        ) : null}
      </span>

      <span className="shrink-0 text-right">
        <span className="lv-price block text-body-strong text-lv-gold-700">{formatUnitPrice(priceFor(server))}</span>
        <span className="block text-small text-lv-muted">/tương tác</span>
        {server.source === "demo" ? (
          <Badge tone="warning" className="mt-1">
            DEMO
          </Badge>
        ) : null}
        {!server.available ? (
          <Badge tone="danger" className="mt-1">
            Bảo trì
          </Badge>
        ) : null}
      </span>
    </button>
  );
}

function ServerFact({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="flex shrink-0 items-center gap-1 text-lv-muted">
        {icon}
        {label}
      </span>
      <span className="min-w-0 break-words font-semibold text-lv-text">{value}</span>
    </span>
  );
}
