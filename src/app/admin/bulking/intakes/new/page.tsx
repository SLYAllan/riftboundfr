import { verifyAdmin } from "@/lib/auth";
import { IntakeEditor } from "../intake-editor";

export default async function NewIntakePage() { await verifyAdmin(); return <IntakeEditor />; }
