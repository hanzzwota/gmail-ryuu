import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, CheckCircle2, XCircle, Search } from "lucide-react";
import {
  NeoCard,
  NeoButton,
  NeoInput,
  NeoTextarea,
  NeoLabel,
  NeoBadge,
  NeoSelect,
  SectionTitle,
  EmptyState,
  formatRp,
} from "@/components/neo";
import {
  adminOverview,
  adminListSubmissions,
  adminReviewSubmissions,
  adminApproveAllPending,
  adminListWithdrawals,
  adminReviewWithdrawal,
  adminListUsers,
  adminUpdateUser,
  adminToggleRole,
  adminGetSettings,
  adminUpdateSettings,
  adminListTickets,
  adminCloseTicket,
  adminAuditLogs,
} from "@/lib/admin.functions";
import { replyTicket } from "@/lib/support.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Panel administrasi setoran, penarikan, pengguna, dan pengaturan.",
      },
      { property: "og:title", content: "Admin — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Kelola setoran, penarikan, pengguna, tiket, dan pengaturan.",
      },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  { id: "setoran", label: "Setoran" },
  { id: "penarikan", label: "Penarikan" },
  { id: "pengguna", label: "Pengguna" },
  { id: "pengaturan", label: "Pengaturan" },
  { id: "tiket", label: "Tiket" },
  { id: "log", label: "Log" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function fmtDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" });
}

function AdminPage() {
  const [tab, setTab] = useState<TabId>("setoran");
  const overview = useQuery({ queryKey: ["admin", "overview"], queryFn: () => adminOverview() });

  if (overview.isError) {
    return (
      <div className="space-y-4">
        <SectionTitle title="Admin" subtitle="Panel administrasi." />
        <NeoCard>
          <p className="text-sm font-bold uppercase">
            Akses ditolak. Halaman ini hanya untuk admin.
          </p>
        </NeoCard>
      </div>
    );
  }

  const o = overview.data;

  return (
    <div className="space-y-5">
      <SectionTitle title="Admin Panel" subtitle="Kelola setoran, penarikan, pengguna, tiket, dan sistem (Ryuu0508)." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total Pengguna" value={o?.totalUsers ?? 0} />
        <Stat label="Setoran Hari Ini" value={o?.todaySubmissions ?? 0} />
        <Stat label="Setoran Pending" value={o?.pendingSubmissions ?? 0} />
        <Stat label="Tarik Pending" value={o?.pendingWithdrawals ?? 0} />
        <Stat label="Tiket Terbuka" value={o?.openTickets ?? 0} />
        <Stat label="Total Dibayar" value={formatRp(o?.totalPaid ?? 0)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`neo-press rounded-md border-[3px] border-ink px-3 py-1.5 font-display text-xs font-bold uppercase shadow-neo-sm ${
              tab === t.id ? "bg-primary text-primary-foreground" : "bg-card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "setoran" ? <SubmissionsTab /> : null}
      {tab === "penarikan" ? <WithdrawalsTab /> : null}
      {tab === "pengguna" ? <UsersTab /> : null}
      {tab === "pengaturan" ? <SettingsTab /> : null}
      {tab === "tiket" ? <TicketsTab /> : null}
      {tab === "log" ? <LogsTab /> : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <NeoCard className="p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="neo-heading mt-1 text-xl">{value}</p>
    </NeoCard>
  );
}

/* ---------------- Setoran ---------------- */

function SubmissionsTab() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const list = useQuery({
    queryKey: ["admin", "submissions", status],
    queryFn: () => adminListSubmissions({ data: { status } }),
  });

  const done = (msg: string) => {
    toast.success(msg);
    setSelected([]);
    setNote("");
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const review = useMutation({
    mutationFn: (vars: { ids: string[]; approve: boolean; note?: string }) =>
      adminReviewSubmissions({ data: vars }),
    onSuccess: (res) => done(`${res.updated} setoran diproses.`),
    onError: (e: Error) => toast.error(e.message),
  });

  const approveAll = useMutation({
    mutationFn: () => adminApproveAllPending(),
    onSuccess: (res) => done(`${res.updated} setoran disetujui.`),
    onError: (e: Error) => toast.error(e.message),
  });

  const allRows = list.data ?? [];
  const rows = allRows.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const username = (r as unknown as { profiles: { username: string } }).profiles?.username ?? "";
    return r.account_ref.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  const allIds = rows.map((r) => r.id);

  return (
    <NeoCard>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-40">
            <NeoLabel>Filter Status</NeoLabel>
            <NeoSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Ditolak</option>
              <option value="ALL">Semua</option>
            </NeoSelect>
          </div>
          <div className="w-48">
            <NeoLabel>Cari Gmail / User</NeoLabel>
            <NeoInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <NeoButton
            size="sm"
            variant="secondary"
            onClick={() => setSelected(selected.length === allIds.length ? [] : allIds)}
          >
            {selected.length === allIds.length && allIds.length > 0 ? "Batal Pilih" : "Pilih Semua"}
          </NeoButton>
          <NeoButton size="sm" onClick={() => approveAll.mutate()} disabled={approveAll.isPending}>
            ACC Semua Pending
          </NeoButton>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <NeoInput
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan admin (opsional untuk penolakan)"
        />
        <div className="flex gap-2">
          <NeoButton
            size="sm"
            disabled={selected.length === 0 || review.isPending}
            onClick={() => review.mutate({ ids: selected, approve: true })}
          >
            ACC ({selected.length})
          </NeoButton>
          <NeoButton
            size="sm"
            variant="danger"
            disabled={selected.length === 0 || review.isPending}
            onClick={() => review.mutate({ ids: selected, approve: false, note })}
          >
            Tolak
          </NeoButton>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rows.length === 0 ? <EmptyState text="Tidak ada data setoran ditemukan." /> : null}
        {rows.map((r) => {
          const username = (r as unknown as { profiles: { username: string } }).profiles?.username || "Pengguna";
          const checked = selected.includes(r.id);
          return (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border-[3px] border-ink bg-card px-3 py-2 shadow-neo-sm"
            >
              <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((prev) =>
                      prev.includes(r.id) ? prev.filter((i) => i !== r.id) : [...prev, r.id],
                    )
                  }
                  className="size-4 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="break-all font-mono text-sm font-bold">{r.account_ref}</p>
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">
                    User: <span className="text-foreground">{username}</span> • Rate: {formatRp(r.rate)} • {fmtDate(r.created_at)}
                  </p>
                </div>
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <NeoBadge
                  tone={
                    r.status === "ACCEPTED"
                      ? "primary"
                      : r.status === "PENDING"
                        ? "warning"
                        : "danger"
                  }
                >
                  {r.status}
                </NeoBadge>
                {r.status === "PENDING" ? (
                  <div className="flex gap-1">
                    <NeoButton
                      size="sm"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ ids: [r.id], approve: true })}
                    >
                      <CheckCircle2 className="size-3.5" /> ACC
                    </NeoButton>
                    <NeoButton
                      size="sm"
                      variant="danger"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ ids: [r.id], approve: false, note })}
                    >
                      <XCircle className="size-3.5" /> Tolak
                    </NeoButton>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </NeoCard>
  );
}

/* ---------------- Penarikan ---------------- */

function WithdrawalsTab() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin", "withdrawals"],
    queryFn: () => adminListWithdrawals(),
  });
  const act = useMutation({
    mutationFn: (vars: { id: string; action: "APPROVE" | "PAY" | "REJECT"; note?: string }) =>
      adminReviewWithdrawal({ data: vars }),
    onSuccess: () => {
      toast.success("Penarikan diperbarui.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  return (
    <div className="space-y-3">
      {rows.length === 0 ? <EmptyState text="Belum ada permintaan penarikan." /> : null}
      {rows.map((w) => {
        const p = (w as unknown as { profiles: { username: string; whatsapp: string | null } })
          .profiles;
        return (
          <NeoCard key={w.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="neo-heading text-lg">{formatRp(w.amount)}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Pengguna: <span className="text-foreground">{p?.username || "Unknown"}</span> • Metode: {w.method} • Rek/E-wallet: {w.account_number} a/n {w.account_name}
                </p>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  WA: {p?.whatsapp ?? "-"} • Tgl: {fmtDate(w.created_at)}
                </p>
              </div>
              <NeoBadge
                tone={
                  w.status === "PAID" ? "primary" : w.status === "REJECTED" ? "danger" : "warning"
                }
              >
                {w.status}
              </NeoBadge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-ink/15 pt-2">
              <NeoButton
                size="sm"
                variant="secondary"
                disabled={act.isPending}
                onClick={() => act.mutate({ id: w.id, action: "APPROVE" })}
              >
                Proses
              </NeoButton>
              <NeoButton
                size="sm"
                disabled={act.isPending}
                onClick={() => act.mutate({ id: w.id, action: "PAY" })}
              >
                Tandai Dibayar
              </NeoButton>
              <NeoButton
                size="sm"
                variant="danger"
                disabled={act.isPending}
                onClick={() => {
                  const note = window.prompt("Alasan penolakan?") ?? "";
                  act.mutate({ id: w.id, action: "REJECT", note });
                }}
              >
                Tolak &amp; Refund
              </NeoButton>
            </div>
          </NeoCard>
        );
      })}
    </div>
  );
}

/* ---------------- Pengguna ---------------- */

function UsersTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["admin", "users"], queryFn: () => adminListUsers() });
  
  const update = useMutation({
    mutationFn: (vars: { id: string; suspended?: boolean; adjust?: number; adjustNote?: string }) =>
      adminUpdateUser({ data: vars }),
    onSuccess: () => {
      toast.success("Data pengguna diperbarui.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleRole = useMutation({
    mutationFn: (vars: { userId: string; makeAdmin: boolean }) => adminToggleRole({ data: vars }),
    onSuccess: () => {
      toast.success("Role pengguna diperbarui.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (list.data ?? []).filter((u) =>
    q ? `${u.username} ${u.email ?? ""} ${u.whatsapp ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <NeoInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari username, email, atau whatsapp..."
        />
      </div>
      {rows.length === 0 ? <EmptyState text="Tidak ada pengguna ditemukan." /> : null}
      {rows.map((u) => (
        <NeoCard key={u.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className="neo-heading text-base">{u.username}</p>
                {u.isAdmin ? <NeoBadge tone="info">Admin</NeoBadge> : null}
                <NeoBadge tone={u.suspended ? "danger" : "primary"}>
                  {u.suspended ? "Dibekukan" : "Aktif"}
                </NeoBadge>
              </div>
              <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">
                Email: {u.email || "-"} • WA: {u.whatsapp || "-"}
              </p>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Pembayaran: {u.payment_method || "-"} {u.payment_account || ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Saldo Pengguna</p>
              <p className="neo-heading text-lg text-primary">{formatRp(u.balance)}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t-2 border-ink/15 pt-2">
            <NeoButton
              size="sm"
              variant={u.suspended ? "secondary" : "danger"}
              disabled={update.isPending}
              onClick={() => update.mutate({ id: u.id, suspended: !u.suspended })}
            >
              {u.suspended ? "Aktifkan Akun" : "Bekukan Akun"}
            </NeoButton>
            <NeoButton
              size="sm"
              variant="secondary"
              disabled={update.isPending}
              onClick={() => {
                const raw = window.prompt("Penyesuaian saldo (boleh minus, contoh: 5000):");
                if (!raw) return;
                const value = Number(raw);
                if (!Number.isFinite(value) || value === 0) {
                  toast.error("Nilai tidak valid.");
                  return;
                }
                const adjustNote = window.prompt("Catatan penyesuaian:") ?? "";
                update.mutate({ id: u.id, adjust: value, adjustNote });
              }}
            >
              Sesuaikan Saldo
            </NeoButton>
            <NeoButton
              size="sm"
              variant={u.isAdmin ? "danger" : "primary"}
              disabled={toggleRole.isPending}
              onClick={() => toggleRole.mutate({ userId: u.id, makeAdmin: !u.isAdmin })}
            >
              {u.isAdmin ? "Hapus Admin" : "Jadikan Admin"}
            </NeoButton>
          </div>
        </NeoCard>
      ))}
    </div>
  );
}

/* ---------------- Pengaturan ---------------- */

function SettingsTab() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["admin", "settings"], queryFn: () => adminGetSettings() });
  const [form, setForm] = useState<Record<string, string | number | boolean> | null>(null);

  const value = form ?? (settings.data as Record<string, string | number | boolean> | null);

  const save = useMutation({
    mutationFn: (patch: Record<string, string | number | boolean>) =>
      adminUpdateSettings({ data: patch }),
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan!");
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!value) return <NeoCard>Memuat pengaturan sistem...</NeoCard>;

  const set = (key: string, v: string | number | boolean) =>
    setForm({ ...(value as Record<string, string | number | boolean>), [key]: v });

  const text = (key: string) => String(value[key] ?? "");
  const num = (key: string) => Number(value[key] ?? 0);

  const dailyQuotaActive = num("daily_quota") > 0;
  const maxBulkActive = num("max_bulk") > 0;

  return (
    <NeoCard>
      <div className="mb-4 flex items-center justify-between border-b-[3px] border-ink pb-3">
        <div>
          <h2 className="neo-heading text-lg">Pengaturan Sistem Admin (Ryuu0508)</h2>
          <p className="text-xs font-semibold text-muted-foreground">
            Atur rate, rules hari ini, kuota, max baris, pengumuman, dan kontak sosial.
          </p>
        </div>
        <NeoBadge tone="primary">Admin Ryuu0508</NeoBadge>
      </div>

      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({
            dashboard_name: text("dashboard_name") || "S3L RYU88 GMAIL",
            rate_per_account: num("rate_per_account"),
            daily_quota: num("daily_quota"),
            max_bulk: num("max_bulk"),
            min_withdrawal: num("min_withdrawal"),
            submission_open: Boolean(value["submission_open"]),
            deposit_password: text("deposit_password"),
            whatsapp_link: text("whatsapp_link"),
            tiktok_link: text("tiktok_link"),
            announcement_title: text("announcement_title") || "PENGUMUMAN RESMI ADMIN RYUU0508",
            announcement: text("announcement"),
            rules_today: text("rules_today"),
            human_support_enabled: Boolean(value["human_support_enabled"]),
            ai_faq_enabled: Boolean(value["ai_faq_enabled"]),
          });
        }}
      >
        <div>
          <NeoLabel>Nama Dashboard / Platform</NeoLabel>
          <NeoInput
            value={text("dashboard_name")}
            onChange={(e) => set("dashboard_name", e.target.value)}
            placeholder="S3L RYU88 GMAIL"
          />
        </div>

        <div>
          <NeoLabel>Rate per Akun Gmail (Rp)</NeoLabel>
          <NeoInput
            type="number"
            value={num("rate_per_account")}
            onChange={(e) => set("rate_per_account", Number(e.target.value))}
          />
        </div>

        <div>
          <NeoLabel>Status Setoran (Buka/Tutup)</NeoLabel>
          <NeoSelect
            value={value["submission_open"] ? "1" : "0"}
            onChange={(e) => set("submission_open", e.target.value === "1")}
          >
            <option value="1">DIBUKA (User Bisa Stor Akun)</option>
            <option value="0">DITUTUP (Setoran Ditangguhkan)</option>
          </NeoSelect>
        </div>

        <div>
          <NeoLabel>Minimal Penarikan Saldo (Rp)</NeoLabel>
          <NeoInput
            type="number"
            value={num("min_withdrawal")}
            onChange={(e) => set("min_withdrawal", Number(e.target.value))}
          />
        </div>

        <div className="rounded-md border-[3px] border-ink bg-muted p-3 space-y-2">
          <NeoLabel>Batas Setor Hari Ini (Kuota Harian)</NeoLabel>
          <div className="flex items-center gap-2">
            <NeoSelect
              value={dailyQuotaActive ? "1" : "0"}
              onChange={(e) => {
                if (e.target.value === "0") set("daily_quota", 0);
                else set("daily_quota", 50);
              }}
            >
              <option value="1">Aktifkan Batas Kuota</option>
              <option value="0">Nonaktifkan (Tanpa Batas / Unlimited)</option>
            </NeoSelect>
          </div>
          {dailyQuotaActive ? (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Maksimal Akun per User/Hari:</p>
              <NeoInput
                type="number"
                value={num("daily_quota")}
                onChange={(e) => set("daily_quota", Number(e.target.value))}
                placeholder="Jumlah kuota harian"
              />
            </div>
          ) : (
            <p className="text-xs font-bold text-emerald-600">✓ Kuota harian diset ke Tanpa Batas (Unlimited)</p>
          )}
        </div>

        <div className="rounded-md border-[3px] border-ink bg-muted p-3 space-y-2">
          <NeoLabel>Max Baris Sekali Setor</NeoLabel>
          <div className="flex items-center gap-2">
            <NeoSelect
              value={maxBulkActive ? "1" : "0"}
              onChange={(e) => {
                if (e.target.value === "0") set("max_bulk", 0);
                else set("max_bulk", 50);
              }}
            >
              <option value="1">Aktifkan Max Baris</option>
              <option value="0">Nonaktifkan (Tanpa Batas / Unlimited)</option>
            </NeoSelect>
          </div>
          {maxBulkActive ? (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Maksimal Baris Sekali Kirim:</p>
              <NeoInput
                type="number"
                value={num("max_bulk")}
                onChange={(e) => set("max_bulk", Number(e.target.value))}
                placeholder="Maks baris sekali submit"
              />
            </div>
          ) : (
            <p className="text-xs font-bold text-emerald-600">✓ Limit baris diset ke Tanpa Batas (Unlimited)</p>
          )}
        </div>

        <div>
          <NeoLabel>Password Setoran Hari Ini (Opsional)</NeoLabel>
          <NeoInput
            value={text("deposit_password")}
            onChange={(e) => set("deposit_password", e.target.value)}
            placeholder="Password khusus stor jika ada"
          />
        </div>

        <div>
          <NeoLabel>Link Channel WhatsApp Resmi</NeoLabel>
          <NeoInput
            value={text("whatsapp_link")}
            onChange={(e) => set("whatsapp_link", e.target.value)}
            placeholder="https://whatsapp.com/channel/..."
          />
        </div>

        <div>
          <NeoLabel>Link TikTok Resmi</NeoLabel>
          <NeoInput
            value={text("tiktok_link")}
            onChange={(e) => set("tiktok_link", e.target.value)}
            placeholder="https://tiktok.com/@ryuu0508"
          />
        </div>

        <div>
          <NeoLabel>Judul Pengumuman Modal Pop-up</NeoLabel>
          <NeoInput
            value={text("announcement_title")}
            onChange={(e) => set("announcement_title", e.target.value)}
            placeholder="PENGUMUMAN RESMI ADMIN RYUU0508"
          />
        </div>

        <div className="md:col-span-2">
          <NeoLabel>Isi Pengumuman Otomatis (Pop-up Pop-out Saat Membuka Web)</NeoLabel>
          <NeoTextarea
            rows={4}
            value={text("announcement")}
            onChange={(e) => set("announcement", e.target.value)}
            placeholder="Pengumuman ini akan langsung muncul otomatis saat user membuka website..."
          />
        </div>

        <div className="md:col-span-2">
          <NeoLabel>Rules Hari Ini (Tampil di Halaman Rules &amp; Stor Akun)</NeoLabel>
          <NeoTextarea
            rows={5}
            value={text("rules_today")}
            onChange={(e) => set("rules_today", e.target.value)}
            placeholder="Tuliskan poin-poin aturan hari ini..."
          />
        </div>

        <div>
          <NeoLabel>Support Manusia</NeoLabel>
          <NeoSelect
            value={value["human_support_enabled"] ? "1" : "0"}
            onChange={(e) => set("human_support_enabled", e.target.value === "1")}
          >
            <option value="1">Aktif (Tiket Support Dibuka)</option>
            <option value="0">Nonaktif</option>
          </NeoSelect>
        </div>

        <div>
          <NeoLabel>FAQ AI Assistant</NeoLabel>
          <NeoSelect
            value={value["ai_faq_enabled"] ? "1" : "0"}
            onChange={(e) => set("ai_faq_enabled", e.target.value === "1")}
          >
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </NeoSelect>
        </div>

        <div className="md:col-span-2 pt-2">
          <NeoButton type="submit" size="lg" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Menyimpan Pengaturan..." : "Simpan Seluruh Pengaturan Admin"}
          </NeoButton>
        </div>
      </form>
    </NeoCard>
  );
}

/* ---------------- Tiket ---------------- */

type TicketRow = {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  profiles?: { username: string };
  support_messages?: { id: string; body: string; is_admin: boolean; created_at: string }[];
};

function TicketsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("ALL");
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const list = useQuery({ queryKey: ["admin", "tickets"], queryFn: () => adminListTickets() });
  
  const close = useMutation({
    mutationFn: (id: string) => adminCloseTicket({ data: { id } }),
    onSuccess: () => {
      toast.success("Tiket telah ditutup.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reply = useMutation({
    mutationFn: (vars: { ticket_id: string; body: string }) => replyTicket({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success("Balasan tiket terkirim!");
      setReplyText((prev) => ({ ...prev, [vars.ticket_id]: "" }));
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allRows = (list.data ?? []) as unknown as TicketRow[];
  const rows = allRows.filter((t) => {
    if (filter === "OPEN") return t.status === "OPEN";
    if (filter === "ANSWERED") return t.status === "ANSWERED";
    if (filter === "CLOSED") return t.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="w-48">
        <NeoLabel>Filter Status Tiket</NeoLabel>
        <NeoSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">Semua Tiket</option>
          <option value="OPEN">Terbuka (Butuh Balasan)</option>
          <option value="ANSWERED">Sudah Dibalas</option>
          <option value="CLOSED">Selesai / Ditutup</option>
        </NeoSelect>
      </div>

      {rows.length === 0 ? <EmptyState text="Belum ada tiket support." /> : null}

      {rows.map((t) => {
        const text = replyText[t.id] ?? "";
        return (
          <NeoCard key={t.id}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink/15 pb-2">
              <div>
                <p className="neo-heading text-base">{t.subject}</p>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Pengguna: <span className="text-foreground">{t.profiles?.username || "Pengguna"}</span> • Kategori: {t.category} • Tgl: {fmtDate(t.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <NeoBadge tone={t.status === "OPEN" ? "warning" : t.status === "ANSWERED" ? "info" : "primary"}>
                  {t.status}
                </NeoBadge>
                {t.status !== "CLOSED" ? (
                  <NeoButton size="sm" variant="danger" disabled={close.isPending} onClick={() => close.mutate(t.id)}>
                    Tutup Tiket
                  </NeoButton>
                ) : null}
              </div>
            </div>

            {/* Conversation thread */}
            <div className="my-3 space-y-2 max-h-60 overflow-y-auto pr-1">
              {(t.support_messages ?? []).map((m) => (
                <div
                  key={m.id}
                  className={`rounded-md border-[3px] border-ink p-2.5 text-xs font-medium shadow-neo-sm ${
                    m.is_admin ? "bg-primary/20 border-primary" : "bg-card"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-bold uppercase text-[10px]">
                      {m.is_admin ? "🛡️ Admin Ryuu0508" : `👤 ${t.profiles?.username || "Pengguna"}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{fmtDate(m.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm">{m.body}</p>
                </div>
              ))}
            </div>

            {/* Admin Reply Input */}
            {t.status !== "CLOSED" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  reply.mutate({ ticket_id: t.id, body: text });
                }}
                className="flex gap-2 pt-2 border-t-2 border-ink/15"
              >
                <NeoInput
                  value={text}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))}
                  placeholder="Ketik balasan admin..."
                />
                <NeoButton type="submit" size="sm" disabled={reply.isPending || !text.trim()}>
                  <Send className="size-3.5" />
                  Kirim
                </NeoButton>
              </form>
            ) : null}
          </NeoCard>
        );
      })}
    </div>
  );
}

/* ---------------- Log ---------------- */

function LogsTab() {
  const [search, setSearch] = useState("");
  const list = useQuery({ queryKey: ["admin", "logs"], queryFn: () => adminAuditLogs() });
  const allRows = list.data ?? [];

  const rows = allRows.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.target && l.target.toLowerCase().includes(q)) ||
      (l.detail && l.detail.toLowerCase().includes(q))
    );
  });

  return (
    <NeoCard>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="neo-heading text-base">Audit Log Aktivitas Admin &amp; Sistem</h2>
        <div className="w-60">
          <NeoInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log..."
          />
        </div>
      </div>

      {rows.length === 0 ? <EmptyState text="Belum ada audit log ditemukan." /> : null}

      <div className="space-y-2">
        {rows.map((l) => (
          <div
            key={l.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border-[3px] border-ink bg-card px-3 py-2 text-sm font-semibold shadow-neo-sm"
          >
            <div className="flex items-center gap-2">
              <NeoBadge tone="info">{l.action}</NeoBadge>
              <span className="break-all font-mono text-xs">{l.target ?? "-"}</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground">{l.detail || "-"}</p>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">{fmtDate(l.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </NeoCard>
  );
}
