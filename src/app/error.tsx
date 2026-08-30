"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/blocks/States";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Chưa gắn dịch vụ giám sát lỗi (xem gap backend.orderApi trong FINAL_GAPS_REPORT).
    console.error(error);
  }, [error]);

  return (
    <div className="lv-card">
      <ErrorState
        title="Trang gặp sự cố"
        description="Đã có lỗi khi hiển thị nội dung. Bạn thử tải lại; nếu vẫn lỗi, liên hệ hỗ trợ."
        onRetry={reset}
      />
    </div>
  );
}
