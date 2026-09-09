import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, Wallet, CheckCircle2, Clock } from "lucide-react";
import { NeoCard, NeoBadge, SectionTitle, formatRp } from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Ringkasan setoran, kuota harian, saldo, dan penarikan akun Anda.",
      },
      { property: "og:title", content: "Dashboard — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Pantau setoran, kuota, saldo, dan penarikan dalam satu halaman.",
      },
    ],
  }),
  component: DashboardPage,
});

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <NeoCard className={tone ?? ""}>
      <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
        {label}
      </p>
      <p className="neo-heading mt-1 text-2xl">{value}</p>
    </NeoCard>
  );
}

function DashboardPage() {
  const { data, isLoading } = useBootstrap();

  if (isLoading || !data) {
    return <p className="font-display text-sm font-bold uppercase">Memuat data...</p>;
  }

  const { balance, quota, stats, settings, profile } = data;

  return (
    <div className="space-y-5">
      <SectionTitle
        title={`Halo, ${profile?.username ?? "Pengguna"}`}
        subtitle="Ringkasan aktivitas akun Anda hari ini."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Saldo Tersedia"
          value={formatRp(balance.available)}
          tone="bg-primary text-primary-foreground"
        />
        <Stat label="Estimasi Pending" value={formatRp(balance.pending)} />
        <Stat label="Total Diterima" value={formatRp(balance.totalEarned)} />
        <Stat label="Total Ditarik" value={formatRp(balance.totalWithdrawn)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <NeoCard>
          <div className="flex items-center justify-between">
            <h2 className="neo-heading text-lg">Kuota Harian</h2>
            <NeoBadge tone={settings.submission_open ? "primary" : "danger"}>
              {settings.submission_open ? "Setoran Buka" : "Setoran Tutup"}
            </NeoBadge>
          </div>
          <p className="mt-3 font-display text-3xl font-bold">
            {quota.used} / {quota.limit}
          </p>
          <div className="mt-2 h-4 w-full overflow-hidden rounded border-[3px] border-ink bg-card">
            <div
              className="h-full bg-secondary"
              style={{
                width: `${quota.limit ? Math.min(100, (quota.used / quota.limit) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Sisa kuota hari ini: {quota.remaining} akun • Rate {formatRp(settings.rate_per_account)}
            /akun
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/stor-akun"
              className="neo-press inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-primary px-4 py-2.5 font-display text-sm font-bold uppercase text-primary-foreground shadow-neo"
            >
              <Upload className="size-4" /> Stor Akun
            </Link>
            <Link
              to="/saldo"
              className="neo-press inline-flex items-center gap-2 rounded-md border-[3px] border-ink bg-card px-4 py-2.5 font-display text-sm font-bold uppercase shadow-neo"
            >
              <Wallet className="size-4" /> Tarik Saldo
            </Link>
          </div>
        </NeoCard>

        <NeoCard>
          <h2 className="neo-heading text-lg">Status Setoran</h2>
          <div className="mt-3 space-y-2 text-sm font-semibold">
            <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4" /> Disetujui
              </span>
              <span>{stats.accepted}</span>
            </div>
            <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
              <span className="flex items-center gap-2">
                <Clock className="size-4" /> Menunggu review
              </span>
              <span>{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
              <span>Ditolak</span>
              <span>{stats.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total setoran</span>
              <span>{stats.total}</span>
            </div>
          </div>
          <Link to="/riwayat" className="mt-4 inline-block text-sm font-bold underline">
            Lihat riwayat lengkap
          </Link>
        </NeoCard>
      </div>
    </div>
  );
}
