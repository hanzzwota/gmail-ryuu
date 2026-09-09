import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Wallet, Bot } from "lucide-react";
import { NeoCard, NeoBadge } from "@/components/neo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "S3L RYU88 GMAIL — Setorkan Gmail Mu Sekarang Juga" },
      {
        name: "description",
        content:
          "Setor akun Gmail, pantau kuota harian, kelola saldo dan penarikan, serta hubungi support dalam satu dashboard.",
      },
      { property: "og:title", content: "S3L RYU88 GMAIL — Setorkan Gmail Mu Sekarang Juga" },
      {
        property: "og:description",
        content:
          "Setoran, kuota, saldo, penarikan, dan support dalam satu dashboard bergaya NeoBrutalism.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Zap,
    title: "Setoran Cepat",
    text: "Kirim satu per satu atau massal. Validasi format, duplikat, dan kuota otomatis di server.",
  },
  {
    icon: Wallet,
    title: "Saldo Transparan",
    text: "Setiap kredit, reservasi, refund, dan pembayaran tercatat permanen dan bisa diaudit.",
  },
  {
    icon: Bot,
    title: "Carsloss Support AI",
    text: "Tanya kapan saja soal rate, kuota, status, dan penarikan.",
  },
];

function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-14">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <div className="neo-heading text-xl">S3L RYU88 GMAIL</div>
        <Link
          to="/auth"
          className="neo-press rounded-md border-[3px] border-ink bg-foreground px-4 py-2 font-display text-sm font-bold uppercase text-background shadow-neo"
        >
          Masuk
        </Link>
      </header>

      <section className="grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <NeoBadge tone="primary">Platform Manajemen Akun v2.0</NeoBadge>
          <h1 className="neo-heading mt-4 text-4xl leading-[0.95] sm:text-6xl">
            Setor, review,
            <br />
            <span className="bg-primary px-2 text-primary-foreground">cairkan saldo</span>
            <br />
            tanpa ribet.
          </h1>
          <p className="mt-5 max-w-lg text-base font-medium text-muted-foreground">
            Dashboard terpusat untuk setoran akun terotorisasi, kuota harian, status review, saldo,
            penarikan, dan support.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="neo-press rounded-md border-[3px] border-ink bg-primary px-6 py-3.5 font-display text-base font-bold uppercase text-primary-foreground shadow-neo"
            >
              Mulai Setor
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="neo-press rounded-md border-[3px] border-ink bg-card px-6 py-3.5 font-display text-base font-bold uppercase shadow-neo"
            >
              Daftar Akun
            </Link>
          </div>
        </div>

        <NeoCard className="border-[4px] bg-foreground p-6 text-background shadow-neo-lg">
          <p className="font-display text-xs font-bold uppercase tracking-widest opacity-70">
            Rate Berjalan
          </p>
          <p className="neo-heading mt-2 text-5xl text-primary">Rp 4.500</p>
          <p className="mt-1 text-xs font-bold uppercase opacity-70">per akun disetujui</p>
          <div className="mt-6 space-y-2 text-sm font-semibold">
            <div className="flex justify-between border-b-2 border-background/20 pb-2">
              <span>Minimal withdraw</span>
              <span className="text-primary">Rp 4.000</span>
            </div>
            <div className="flex justify-between border-b-2 border-background/20 pb-2">
              <span>Review setoran</span>
              <span className="text-primary">Manual admin</span>
            </div>
            <div className="flex justify-between">
              <span>Kredensial diminta</span>
              <span className="text-primary">Tidak pernah</span>
            </div>
          </div>
        </NeoCard>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <NeoCard key={f.title} className="h-full">
            <div className="mb-3 inline-flex rounded-md border-[3px] border-ink bg-secondary p-2 text-secondary-foreground shadow-neo-sm">
              <f.icon className="size-5" />
            </div>
            <h2 className="neo-heading text-base">{f.title}</h2>
            <p className="mt-1.5 text-sm font-medium text-muted-foreground">{f.text}</p>
          </NeoCard>
        ))}
      </section>

      <footer className="mt-14 border-t-[3px] border-ink pt-5 text-xs font-bold uppercase text-muted-foreground">
        S3L RYU88 GMAIL — Gunakan hanya untuk data akun yang Anda miliki izin atasnya.
      </footer>
    </div>
  );
}
