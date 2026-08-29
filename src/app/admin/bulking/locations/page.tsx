import { verifyAdmin } from "@/lib/auth";
import { SimpleReferences } from "../simple-references";

export default async function LocationsPage() { await verifyAdmin(); return <SimpleReferences endpoint="/api/admin/bulking/locations" titre="Emplacements" avecNotes />; }
