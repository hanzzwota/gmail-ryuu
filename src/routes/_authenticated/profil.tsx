import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NeoButton, NeoCard, NeoInput, NeoLabel, NeoSelect, SectionTitle } from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";
import { updateProfile } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Profil — S3L RYU88 GMAIL" },
      {
        name: "description",
        content:
          "Kelola nama pengguna, nomor WhatsApp, tujuan pembayaran, dan kata sandi akun Anda.",
      },
      { property: "og:title", content: "Profil — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Perbarui data akun dan tujuan pembayaran penarikan saldo Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const METHODS = ["DANA", "OVO", "GOPAY", "BANK"] as const;

function Page() {
  const { data, isLoading } = useBootstrap();
  const qc = useQueryClient();

  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [method, setMethod] = useState("DANA");
  const [account, setAccount] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!data?.profile) return;
    setUsername(data.profile.username ?? "");
    setWhatsapp(data.profile.whatsapp ?? "");
    setMethod(data.profile.payment_method ?? "DANA");
    setAccount(data.profile.payment_account ?? "");
  }, [data?.profile]);

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        data: {
          username,
          whatsapp,
          payment_method: method,
          payment_account: account,
        },
      }),
    onSuccess: () => {
      toast.success("Profil tersimpan.");
      qc.invalidateQueries({ queryKey: ["bootstrap"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Gagal menyimpan profil."),
  });

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Kata sandi baru minimal 8 karakter.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    } as { password: string });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Kata sandi berhasil diperbarui.");
    setCurrentPassword("");
    setNewPassword("");
  };

  if (isLoading || !data) {
    return <p className="font-display text-sm font-bold uppercase">Memuat data...</p>;
  }

  return (
    <div className="space-y-5">
      <SectionTitle title="Profil" subtitle="Kelola data akun dan tujuan pembayaran Anda." />

      <div className="grid gap-4 lg:grid-cols-2">
        <NeoCard>
          <h2 className="neo-heading text-lg">Data Akun</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <div>
              <NeoLabel>Email</NeoLabel>
              <NeoInput value={data.profile?.email ?? "-"} readOnly disabled />
            </div>
            <div>
              <NeoLabel>Nama Pengguna</NeoLabel>
              <NeoInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div>
              <NeoLabel>Nomor WhatsApp</NeoLabel>
              <NeoInput
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <NeoLabel>Metode Pembayaran</NeoLabel>
                <NeoSelect value={method} onChange={(e) => setMethod(e.target.value)}>
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </NeoSelect>
              </div>
              <div>
                <NeoLabel>Nomor / Rekening</NeoLabel>
                <NeoInput
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <NeoButton type="submit" size="lg" className="w-full" disabled={save.isPending}>
              {save.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </NeoButton>
          </form>
        </NeoCard>

        <div className="space-y-4">
          <NeoCard>
            <h2 className="neo-heading text-lg">Ganti Kata Sandi</h2>
            <form className="mt-4 space-y-3" onSubmit={changePassword}>
              <div>
                <NeoLabel>Kata Sandi Saat Ini</NeoLabel>
                <NeoInput
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <NeoLabel>Kata Sandi Baru</NeoLabel>
                <NeoInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  required
                />
              </div>
              <NeoButton
                type="submit"
                tone="dark"
                size="lg"
                className="w-full"
                disabled={savingPassword}
              >
                {savingPassword ? "Memproses..." : "Perbarui Kata Sandi"}
              </NeoButton>
            </form>
          </NeoCard>

          <NeoCard className="bg-secondary">
            <h2 className="neo-heading text-lg">Status Akun</h2>
            <ul className="mt-3 space-y-1.5 text-sm font-semibold">
              <li>Status: {data.profile?.suspended ? "Dibekukan" : "Aktif"}</li>
              <li>Total setoran: {data.stats.total}</li>
              <li>Setoran disetujui: {data.stats.accepted}</li>
              <li>Peran: {data.isAdmin ? "Admin" : "Member"}</li>
            </ul>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
