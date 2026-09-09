import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, Info, CalendarClock } from "lucide-react";
import { NeoCard, NeoBadge, SectionTitle, formatRp } from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/rules")({
  head: () => ({
    meta: [
      { title: "Rules — S3L RYU88 GMAIL" },
      {
        name: "description",
        content:
          "Aturan setoran bulk Gmail hari ini, kuota harian, format setoran, dan syarat penarikan saldo.",
      },
      { property: "og:title", content: "Rules — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Baca aturan bulk Gmail hari ini, kuota harian, dan ketentuan penarikan saldo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const ALLOWED = [
  "Satu email Gmail per baris, tanpa tambahan tanda atau teks lain.",
  "Akun Gmail dibuat sendiri dan belum pernah disetorkan ke pihak mana pun.",
  "Password setoran wajib sesuai dengan rules yang berlaku hari ini.",
  "Akun aktif dan bisa login normal saat dicek admin.",
  "Data penarikan (nama & nomor) sesuai dengan pemilik akun.",
];

const FORBIDDEN = [
  "Menyetor akun milik orang lain atau hasil pembelian ulang.",
  "Mengirim ulang akun yang sudah pernah masuk sistem (duplikat otomatis ditolak).",
  "Menggunakan banyak akun member untuk melewati kuota harian.",
  "Mengubah akun setelah setoran disetujui.",
  "Memberi data palsu saat mengajukan penarikan saldo.",
];

function Item({ text, ok }: { text: string; ok: boolean }) {
  return (
    <li className="flex items-start gap-2 border-b-2 border-ink/15 pb-2 last:border-0 last:pb-0">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span className="text-sm font-medium">{text}</span>
    </li>
  );
}

function Page() {
  const { data } = useBootstrap();
  const s = data?.settings;
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Rules"
        subtitle="Aturan yang berlaku hari ini untuk setoran bulk Gmail."
      />

      <NeoCard className="bg-warning text-warning-foreground">
        <div className="flex items-start gap-2">
          <CalendarClock className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest">
              Rules Hari Ini — {today}
            </p>
            <p className="mt-1 whitespace-pre-line text-sm font-bold">
              {s?.rules_today || "Belum ada aturan khusus untuk hari ini."}
            </p>
          </div>
        </div>
      </NeoCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NeoCard className="bg-primary text-primary-foreground">
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-80">
            Rate per Akun
          </p>
          <p className="neo-heading mt-1 text-2xl">{formatRp(s?.rate_per_account ?? 0)}</p>
        </NeoCard>
        <NeoCard>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
            Kuota Harian
          </p>
          <p className="neo-heading mt-1 text-2xl">
            {s?.daily_quota && s.daily_quota > 0 ? `${s.daily_quota} akun` : "Tanpa Batas"}
          </p>
        </NeoCard>
        <NeoCard>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
            Maksimal Sekali Kirim
          </p>
          <p className="neo-heading mt-1 text-2xl">
            {s?.max_bulk && s.max_bulk > 0 ? `${s.max_bulk} baris` : "Tanpa Batas"}
          </p>
        </NeoCard>
        <NeoCard>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
            Minimal Penarikan
          </p>
          <p className="neo-heading mt-1 text-2xl">{formatRp(s?.min_withdrawal ?? 0)}</p>
        </NeoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NeoCard>
          <div className="flex items-center justify-between">
            <h2 className="neo-heading text-lg">Yang Diperbolehkan</h2>
            <NeoBadge tone="primary">Wajib</NeoBadge>
          </div>
          <ul className="mt-3 space-y-2">
            {ALLOWED.map((t) => (
              <Item key={t} text={t} ok />
            ))}
          </ul>
        </NeoCard>

        <NeoCard>
          <div className="flex items-center justify-between">
            <h2 className="neo-heading text-lg">Yang Dilarang</h2>
            <NeoBadge tone="danger">Sanksi</NeoBadge>
          </div>
          <ul className="mt-3 space-y-2">
            {FORBIDDEN.map((t) => (
              <Item key={t} text={t} ok={false} />
            ))}
          </ul>
        </NeoCard>
      </div>

      <NeoCard>
        <h2 className="neo-heading text-lg">Alur Setoran &amp; Pembayaran</h2>
        <ol className="mt-3 space-y-2 text-sm font-medium">
          <li>1. Kirim daftar Gmail di halaman Stor Akun beserta password setoran hari ini.</li>
          <li>2. Setoran masuk status Menunggu review dan dicek admin.</li>
          <li>3. Jika disetujui, saldo bertambah {formatRp(s?.rate_per_account ?? 0)} per akun.</li>
          <li>4. Ajukan penarikan minimal {formatRp(s?.min_withdrawal ?? 0)} di halaman Saldo.</li>
          <li>5. Penarikan diproses admin pada jam kerja, maksimal 1x24 jam.</li>
        </ol>
      </NeoCard>

      <NeoCard className="bg-destructive text-destructive-foreground">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p className="text-sm font-bold">
            Pelanggaran aturan dapat menyebabkan setoran ditolak tanpa pembayaran, saldo dibekukan,
            atau akun member dinonaktifkan permanen.
          </p>
        </div>
      </NeoCard>
    </div>
  );
}
