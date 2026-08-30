import type { Metadata } from "next";
import { ApiDocsView } from "@/components/views/ApiDocsView";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "Tài liệu REST API, khoá truy cập, hạn mức và webhook.",
};

export default function Page() {
  return <ApiDocsView />;
}
