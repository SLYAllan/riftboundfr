export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function AdminEventsPage() {
  await verifyAdmin();

  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
        Événements
      </h1>

      <div className="rounded-xl bg-surface border border-hairline overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium">Titre</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium">Type</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium">Date</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium">Lieu</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                <td className="px-4 py-3 text-ink">{event.title}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary capitalize">{event.type}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{formatDate(event.date)}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{event.location ?? "En ligne"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${event.published ? "bg-success/10 text-success" : "bg-surface-overlay text-ink-muted"}`}>
                    {event.published ? "Publie" : "Brouillon"}
                  </span>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Aucun evenement</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
