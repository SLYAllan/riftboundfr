import { verifyAdmin } from "@/lib/auth";
import { IntakeEditor } from "../intake-editor";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) { await verifyAdmin(); const { id } = await params; return <IntakeEditor id={id} />; }
