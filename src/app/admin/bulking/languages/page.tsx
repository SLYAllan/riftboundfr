import { verifyAdmin } from "@/lib/auth";
import { SimpleReferences } from "../simple-references";

export default async function LanguagesPage() { await verifyAdmin(); return <SimpleReferences endpoint="/api/admin/bulking/languages" titre="Langues" libelleRequis />; }
