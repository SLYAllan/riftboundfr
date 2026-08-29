import { BulkNav } from "./nav";
import { verifyAdmin } from "@/lib/auth";

export default async function BulkLayout({ children }: { children: React.ReactNode }) {
  await verifyAdmin();
  return <div className="space-y-6"><BulkNav />{children}</div>;
}
