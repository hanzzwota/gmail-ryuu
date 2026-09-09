import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { NeoCard, NeoBadge, NeoSelect, SectionTitle, EmptyState, formatRp } from "@/components/neo";
import { listSubmissions } from "@/lib/submissions.functions";

export const Route = createFileRoute("/_authenticated/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat Setoran — S3L RYU88 GMAIL" },
      { name: "description", content: "Pantau status setiap setoran akun yang Anda kirim." },
      { property: "og:title", content: "Riwayat Setoran — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Status setoran: pending, disetujui, atau ditolak." },
    ],
  }),
  component: RiwayatPage,
});

const toneOf = (status: string) =>
  status === "ACCEPTED"
    ? "primary"
    : status === "PENDING"
      ? "warning"
      : status === "REJECTED"
        ? "danger"
        : "neutral";

function RiwayatPage() {
  const [filter, setFilter] = useState("ALL");
  const { data, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => listSubmissions(),
  });

  const rows = (data ?? []).filter((r) => filter === "ALL" || r.status === filter);

  return (
    <div className="space-y-5">
      <SectionTitle title="Riwayat Setoran" subtitle="Semua setoran beserta status reviewnya." />

      <NeoCard>
        <div className="mb-3 max-w-xs">
          <NeoSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="ALL">Semua status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
            <option value="DUPLICATE">Duplikat</option>
            <option value="INVALID">Tidak valid</option>
          </NeoSelect>
        </div>

        {isLoading ? (
          <p className="font-display text-sm font-bold uppercase">Memuat...</p>
        ) : rows.length === 0 ? (
          <EmptyState text="Belum ada setoran" />
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border-[3px] border-ink bg-card px-3 py-2.5 shadow-neo-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">{r.account_ref}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("id-ID")}
                    {r.admin_note ? ` • ${r.admin_note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold">{formatRp(r.rate)}</span>
                  <NeoBadge tone={toneOf(r.status)}>{r.status}</NeoBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </NeoCard>
    </div>
  );
}
