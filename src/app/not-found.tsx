import { IconMoodSad } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/blocks/States";

export default function NotFound() {
  return (
    <div className="lv-card">
      <EmptyState
        icon={<IconMoodSad size={22} />}
        title="Không tìm thấy trang"
        description="Đường dẫn bạn mở không tồn tại hoặc đã được đổi tên."
        action={<LinkButton href="/">Về trang chủ</LinkButton>}
      />
    </div>
  );
}
