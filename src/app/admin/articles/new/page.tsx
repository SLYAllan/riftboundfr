import { verifyAdmin } from "@/lib/auth";
import { BlockEditor } from "@/components/admin/block-editor";

export default async function NewArticlePage() {
  await verifyAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
        Nouvel article
      </h1>
      <BlockEditor />
    </div>
  );
}
