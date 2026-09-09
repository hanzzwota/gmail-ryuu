import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  History,
  Wallet,
  Bot,
  BookLock,
  UserRound,
  ShieldCheck,
  LogOut,
  Megaphone,
  X,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getBootstrap } from "@/lib/account.functions";
import { NeoBadge, NeoButton } from "@/components/neo";

export const bootstrapQuery = {
  queryKey: ["bootstrap"],
  queryFn: () => getBootstrap(),
};

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stor-akun", label: "Stor Akun", icon: Upload },
  { to: "/riwayat", label: "Riwayat", icon: History },
  { to: "/saldo", label: "Saldo", icon: Wallet },
  { to: "/pengumuman", label: "Announcement", icon: Megaphone },
  { to: "/support", label: "Support AI", icon: Bot },
  { to: "/rules", label: "Rules", icon: BookLock },
  { to: "/profil", label: "Profil", icon: UserRound },
] as const;

const mobileItems = [navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]] as const;

export function useBootstrap() {
  return useQuery(bootstrapQuery);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data } = useBootstrap();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-3 pb-24 pt-4 sm:px-6 lg:pb-8">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col rounded-lg border-[3px] border-ink bg-sidebar p-4 text-sidebar-foreground shadow-neo-lg lg:flex">
          <div className="mb-6">
            <div className="neo-heading text-lg leading-tight text-sidebar-primary">
              {data?.settings.dashboard_name ?? "S3L RYU88"}
            </div>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest opacity-60">
              Account Platform
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-md border-[3px] border-transparent px-3 py-2 font-display text-sm font-bold uppercase transition-colors hover:bg-sidebar-accent"
                activeProps={{
                  className:
                    "border-ink bg-sidebar-primary text-sidebar-primary-foreground shadow-neo-sm",
                }}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            {data?.isAdmin ? (
              <Link
                to="/admin"
                className="mt-2 flex items-center gap-3 rounded-md border-[3px] border-transparent px-3 py-2 font-display text-sm font-bold uppercase transition-colors hover:bg-sidebar-accent"
                activeProps={{
                  className: "border-ink bg-accent text-accent-foreground shadow-neo-sm",
                }}
              >
                <ShieldCheck className="size-4" />
                Admin
              </Link>
            ) : null}
          </nav>
          <button
            onClick={signOut}
            className="neo-press mt-4 flex items-center justify-center gap-2 rounded-md border-[3px] border-ink bg-destructive px-3 py-2 font-display text-sm font-bold uppercase text-destructive-foreground shadow-neo-sm"
          >
            <LogOut className="size-4" /> Keluar
          </button>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 lg:hidden">
            <div className="neo-heading text-xl">
              {data?.settings.dashboard_name ?? "S3L RYU88"}
            </div>
            <div className="flex items-center gap-2">
              {data?.isAdmin ? (
                <Link to="/admin">
                  <NeoBadge tone="info">Admin</NeoBadge>
                </Link>
              ) : null}
              <button
                onClick={signOut}
                className="neo-press rounded-md border-[3px] border-ink bg-destructive p-2 text-destructive-foreground shadow-neo-sm"
                aria-label="Keluar"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </header>

          {data?.settings.announcement ? (
            <>
              <AnnouncementAutoPopup
                title={data.settings.announcement_title}
                content={data.settings.announcement}
                whatsapp={data.settings.whatsapp_link}
                tiktok={data.settings.tiktok_link}
              />
              <div className="mb-4 flex items-start gap-2 rounded-md border-[3px] border-ink bg-warning px-3 py-2 text-warning-foreground shadow-neo">
                <Megaphone className="mt-0.5 size-4 shrink-0" />
                <p className="text-xs font-bold uppercase leading-snug">
                  {data.settings.announcement}
                </p>
              </div>
            </>
          ) : null}

          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t-[3px] border-ink bg-card p-2 lg:hidden">
        {mobileItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 rounded-md border-[3px] border-transparent px-1 py-1.5 text-[10px] font-bold uppercase"
            activeProps={{ className: "border-ink bg-primary text-primary-foreground" }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function AnnouncementAutoPopup({
  title,
  content,
  whatsapp,
  tiktok,
}: {
  title?: string;
  content: string;
  whatsapp?: string;
  tiktok?: string;
}) {
  const [open, setOpen] = useState(true);

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-lg border-[3px] border-ink bg-card p-5 text-card-foreground shadow-neo-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b-[3px] border-ink pb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="size-6 text-primary" />
            <h2 className="neo-heading text-lg">{title || "PENGUMUMAN RESMI"}</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="neo-press rounded-md border-[3px] border-ink bg-destructive px-2.5 py-1 text-xs font-bold uppercase text-destructive-foreground shadow-neo-sm"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="my-4 max-h-[60vh] overflow-y-auto whitespace-pre-line rounded-md border-[3px] border-ink bg-secondary p-4 text-sm font-semibold text-secondary-foreground">
          {content}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-ink/20 pt-3">
          <div className="flex flex-wrap gap-2">
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="neo-press inline-flex items-center gap-1.5 rounded-md border-[3px] border-ink bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase text-white shadow-neo-sm"
              >
                <MessageSquare className="size-3.5" /> WhatsApp
              </a>
            ) : null}
            {tiktok ? (
              <a
                href={tiktok}
                target="_blank"
                rel="noreferrer"
                className="neo-press inline-flex items-center gap-1.5 rounded-md border-[3px] border-ink bg-black px-3 py-1.5 text-xs font-bold uppercase text-white shadow-neo-sm"
              >
                <ExternalLink className="size-3.5" /> TikTok
              </a>
            ) : null}
          </div>
          <NeoButton size="sm" onClick={() => setOpen(false)}>
            Mengerti &amp; Tutup
          </NeoButton>
        </div>
      </div>
    </div>
  );
}
