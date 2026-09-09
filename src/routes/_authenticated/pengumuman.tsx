import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, MessageCircle, Music2, CalendarClock } from "lucide-react";
import { NeoCard, NeoBadge, SectionTitle } from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/pengumuman")({
  head: () => ({
    meta: [
      { title: "Announcement — S3L RYU88 GMAIL" },
      {
        name: "description",
        content:
          "Pengumuman resmi, rules baru hari ini, channel WhatsApp resmi, dan akun TikTok resmi S3L RYU88 GMAIL.",
      },
      { property: "og:title", content: "Announcement — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Rules baru hari ini, channel WhatsApp resmi, dan akun TikTok resmi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

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
        title="Announcement"
        subtitle="Informasi resmi terbaru dari admin. Hanya percaya kanal yang tercantum di sini."
      />

      <NeoCard className="bg-primary text-primary-foreground">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest opacity-80">
              {s?.announcement_title || "PENGUMUMAN RESMI"}
            </p>
            <p className="mt-1 text-sm font-bold leading-relaxed">
              {s?.announcement || "Belum ada pengumuman."}
            </p>
          </div>
        </div>
      </NeoCard>

      <NeoCard>
        <div className="flex items-center justify-between">
          <h2 className="neo-heading text-lg">Rules Baru Hari Ini</h2>
          <NeoBadge tone="warning">
            <CalendarClock className="mr-1 size-3" />
            {today}
          </NeoBadge>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm font-medium">
          {s?.rules_today || "Belum ada aturan baru untuk hari ini."}
        </p>
      </NeoCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <NeoCard className="bg-secondary">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            <h2 className="neo-heading text-lg">Channel WhatsApp Resmi</h2>
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Semua info setoran dan pembayaran diumumkan di channel ini.
          </p>
          {s?.whatsapp_link ? (
            <a
              href={s.whatsapp_link}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-press mt-3 inline-flex items-center justify-center rounded-md border-[3px] border-ink bg-primary px-4 py-2.5 font-display text-sm font-bold uppercase text-primary-foreground shadow-neo"
            >
              Gabung Channel
            </a>
          ) : (
            <p className="mt-3 text-xs font-bold uppercase text-muted-foreground">
              Tautan belum diatur admin.
            </p>
          )}
        </NeoCard>

        <NeoCard className="bg-secondary">
          <div className="flex items-center gap-2">
            <Music2 className="size-5" />
            <h2 className="neo-heading text-lg">Akun TikTok Resmi</h2>
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Tutorial dan update program dibagikan lewat akun TikTok resmi.
          </p>
          {s?.tiktok_link ? (
            <a
              href={s.tiktok_link}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-press mt-3 inline-flex items-center justify-center rounded-md border-[3px] border-ink bg-foreground px-4 py-2.5 font-display text-sm font-bold uppercase text-background shadow-neo"
            >
              Buka TikTok
            </a>
          ) : (
            <p className="mt-3 text-xs font-bold uppercase text-muted-foreground">
              Tautan belum diatur admin.
            </p>
          )}
        </NeoCard>
      </div>

      <NeoCard className="bg-destructive text-destructive-foreground">
        <p className="text-sm font-bold">
          Admin hanya menghubungi lewat kanal resmi di atas. Abaikan siapa pun yang mengaku admin di
          luar kanal ini.
        </p>
      </NeoCard>
    </div>
  );
}
