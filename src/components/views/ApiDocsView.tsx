"use client";

import * as React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import {
  IconActivity,
  IconAlertTriangle,
  IconCircleCheck,
  IconEye,
  IconEyeOff,
  IconKey,
  IconRefresh,
  IconWebhook,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/blocks/PageHeader";
import { SectionCard, StatCard, InfoCard } from "@/components/blocks/Cards";
import { ChartCard, CodeBlock, CopyButton } from "@/components/blocks/Media";
import { ProgressBar } from "@/components/blocks/Commerce";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Tabs, TabPanel } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { account, apiEndpoints, apiStatus, apiUsageSeries } from "@/lib/demo/data";
import { demoBrand } from "@/lib/demo/config";
import { cn, formatNumber, maskSecret } from "@/lib/utils";

/** Token ví dụ là chuỗi giả, ghi rõ trong tài liệu (§13). */
const DEMO_TOKEN = "lv_demo_0000000000000000";
const BASE_URL = `https://${demoBrand.domain}/api/v1`;

const methodTone: Record<string, "success" | "info" | "warning" | "danger"> = {
  GET: "info",
  POST: "success",
  PUT: "warning",
  DELETE: "danger",
};

export function ApiDocsView() {
  const toast = useToast();
  const [revealed, setRevealed] = React.useState(false);
  const [tab, setTab] = React.useState("curl");
  const [webhookUrl, setWebhookUrl] = React.useState("");

  const examples: Record<string, string> = {
    curl: `curl -X POST "${BASE_URL}/orders" \\
  -H "Authorization: Bearer ${DEMO_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "server_id": "fb-like-1",
    "link": "https://facebook.com/demo/posts/1024",
    "quantity": 1000
  }'`,
    node: `const res = await fetch("${BASE_URL}/orders", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.LACVIET_API_TOKEN}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    server_id: "fb-like-1",
    link: "https://facebook.com/demo/posts/1024",
    quantity: 1000,
  }),
});

const data = await res.json();`,
    php: `<?php
$ch = curl_init("${BASE_URL}/orders");
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . getenv("LACVIET_API_TOKEN"),
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "server_id" => "fb-like-1",
    "link" => "https://facebook.com/demo/posts/1024",
    "quantity" => 1000,
  ]),
]);
$response = curl_exec($ch);`,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="API Documentation"
        description="Tích hợp hệ thống của bạn với dịch vụ Lạc Việt qua REST API."
        breadcrumb={[{ label: "Trang chủ", href: "/" }, { label: "API Documentation" }]}
        action={<Badge tone="warning">Môi trường {apiStatus.environment}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Trạng thái API"
          value="Hoạt động"
          tone="success"
          icon={<IconCircleCheck size={20} />}
          hint={`Độ trễ ${apiStatus.latency}`}
        />
        <StatCard label="Uptime 30 ngày" value={apiStatus.uptime} tone="navy" icon={<IconActivity size={20} />} />
        <StatCard label="Phiên bản" value={apiStatus.version} tone="info" icon={<IconKey size={20} />} hint={BASE_URL} />
        <StatCard
          label="Lượt gọi tháng này"
          value={formatNumber(apiStatus.callsThisMonth)}
          suffix={`/ ${formatNumber(apiStatus.quota)}`}
          tone="gold"
          icon={<IconRefresh size={20} />}
        />
      </div>

      <InfoCard title="API thật chưa được cấp phát" tone="warning" icon={<IconAlertTriangle size={16} />}>
        Base URL, khoá và endpoint dưới đây là hợp đồng dự kiến để lập trình trước. Gap:{" "}
        <code className="text-small">backend.orderApi</code>, <code className="text-small">backend.apiTokens</code>.
      </InfoCard>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="min-w-0 space-y-5 xl:col-span-8">
          <SectionCard title="Ví dụ nhanh" description="Tạo một đơn hàng qua API." padded={false}>
            <div className="px-5">
              <Tabs
                ariaLabel="Ngôn ngữ ví dụ"
                value={tab}
                onChange={setTab}
                size="sm"
                items={[
                  { id: "curl", label: "cURL" },
                  { id: "node", label: "Node.js" },
                  { id: "php", label: "PHP" },
                ]}
              />
            </div>
            <div className="p-5">
              {Object.keys(examples).map((k) => (
                <TabPanel key={k} id={k} active={tab === k}>
                  <CodeBlock code={examples[k]} language={k} masked title={`Tạo đơn — ${k}`} />
                </TabPanel>
              ))}
              <p className="mt-3 text-small text-lv-muted">
                Token trong ví dụ là chuỗi giả dùng cho tài liệu. Lưu token thật trong biến môi trường phía
                máy chủ, không đặt trong mã client.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Danh sách endpoint" description={`${apiEndpoints.length} endpoint`} padded={false}>
            <ul className="divide-y divide-lv-border">
              {apiEndpoints.map((ep) => (
                <li key={ep.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={methodTone[ep.method]}>{ep.method}</Badge>
                    <code className="text-body-strong text-lv-text">{ep.path}</code>
                    {ep.auth ? <Badge tone="neutral">Cần token</Badge> : null}
                    <span className="ml-auto text-small text-lv-muted">{ep.rateLimit}</span>
                  </div>
                  <p className="mt-1.5 text-small text-lv-muted">{ep.summary}</p>
                  {ep.params.length > 0 ? (
                    <div className="lv-scroll-x mt-3">
                      <table className="w-full min-w-[520px] border-collapse text-small">
                        <caption className="sr-only">Tham số của {ep.path}</caption>
                        <thead>
                          <tr className="border-b border-lv-border text-left text-lv-muted">
                            <th scope="col" className="py-2 pr-3 font-semibold">Tham số</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Kiểu</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Bắt buộc</th>
                            <th scope="col" className="py-2 font-semibold">Mô tả</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p) => (
                            <tr key={p.name} className="border-b border-lv-border last:border-0">
                              <td className="py-2 pr-3 font-mono text-lv-navy-700">{p.name}</td>
                              <td className="py-2 pr-3 text-lv-muted">{p.type}</td>
                              <td className="py-2 pr-3">
                                {p.required ? <Badge tone="danger">Có</Badge> : <Badge tone="neutral">Không</Badge>}
                              </td>
                              <td className="py-2 text-lv-muted">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>

          <ChartCard title="Lưu lượng gọi API 30 ngày" description="Số lượt gọi mỗi ngày.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiUsageSeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="apiFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#667085" }} width={44} />
                <RTooltip
                  formatter={(v: number) => [formatNumber(v), "Lượt gọi"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6EAF0", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="calls" stroke="#2563EB" strokeWidth={2} fill="url(#apiFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <aside className="min-w-0 space-y-4 xl:col-span-4">
          <SectionCard title="Khoá API">
            <p className="text-small text-lv-muted">Khoá cá nhân dùng cho mọi lệnh gọi. Mặc định che.</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-control border border-lv-border bg-lv-bg px-3 py-2 text-small text-lv-navy-700">
                {revealed ? maskSecret(DEMO_TOKEN) : account.apiTokenMasked}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRevealed((v) => !v)}
                icon={revealed ? <IconEyeOff size={15} /> : <IconEye size={15} />}
              >
                {revealed ? "Ẩn" : "Hiện"}
              </Button>
            </div>
            <p className="mt-2 text-small text-lv-muted">
              Ngay cả khi bấm “Hiện”, bản dựng này chỉ hiển thị chuỗi giả — không có khoá thật nào tồn tại
              trong mã nguồn công khai.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  toast.push({
                    tone: "info",
                    title: "Chưa thể tạo khoá mới",
                    description: "Cần hệ thống cấp phát token thật (gap backend.apiTokens).",
                  })
                }
                icon={<IconRefresh size={15} />}
              >
                Tạo khoá mới
              </Button>
              <CopyButton value={account.apiTokenMasked} label="Chép khoá đã che" />
            </div>
          </SectionCard>

          <SectionCard title="Hạn mức sử dụng">
            <ProgressBar
              label="Lượt gọi tháng này"
              value={apiStatus.callsThisMonth}
              max={apiStatus.quota}
              tone={apiStatus.callsThisMonth / apiStatus.quota > 0.8 ? "danger" : "gold"}
            />
            <ul className="mt-3 space-y-1.5 text-small text-lv-muted">
              <li>· Giới hạn mặc định 60 lượt/phút cho endpoint đọc.</li>
              <li>· Vượt hạn mức trả về mã lỗi 429 kèm thời gian chờ.</li>
              <li>· Cần hạn mức cao hơn, liên hệ để nâng gói.</li>
            </ul>
          </SectionCard>

          <SectionCard title="Webhook / Callback">
            <Label htmlFor="webhook">Địa chỉ nhận sự kiện</Label>
            <Input
              id="webhook"
              placeholder="https://your-domain.com/hooks/lacviet"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <Button
              className="mt-3"
              block
              variant="secondary"
              icon={<IconWebhook size={16} />}
              onClick={() =>
                toast.push({
                  tone: "info",
                  title: "Chưa đăng ký được webhook",
                  description: "Cần backend thật để xác thực địa chỉ callback.",
                })
              }
            >
              Đăng ký webhook
            </Button>
            <div className="mt-3 space-y-1.5 text-small text-lv-muted">
              <p>Sự kiện gửi kèm chữ ký HMAC trong header `X-LacViet-Signature`.</p>
              <p className={cn("font-mono text-lv-navy-700")}>order.completed · order.refunded · balance.updated</p>
            </div>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
