import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  NeoCard,
  NeoBadge,
  NeoButton,
  NeoInput,
  NeoLabel,
  NeoSelect,
  SectionTitle,
  EmptyState,
  formatRp,
} from "@/components/neo";
import { useBootstrap } from "@/components/AppShell";
import { listWithdrawals, requestWithdrawal } from "@/lib/withdrawals.functions";
import { listTransactions } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/saldo")({
  head: () => ({
    meta: [
      { title: "Saldo & Penarikan — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Lihat saldo, riwayat transaksi, dan ajukan penarikan dana.",
      },
      { property: "og:title", content: "Saldo & Penarikan — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Kelola saldo dan ajukan penarikan dana Anda." },
    ],
  }),
  component: SaldoPage,
});

const toneOf = (s: string) => (s === "PAID" ? "primary" : s === "REJECTED" ? "danger" : "warning");

function SaldoPage() {
  const { data: boot } = useBootstrap();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("DANA");
  const [accountNumber, setAccountNumber] = useState(boot?.profile?.payment_account ?? "");
  const [accountName, setAccountName] = useState(boot?.profile?.username ?? "");

  const withdrawals = useQuery({ queryKey: ["withdrawals"], queryFn: () => listWithdrawals() });
  const txns = useQuery({ queryKey: ["transactions"], queryFn: () => listTransactions() });

  const mutation = useMutation({
    mutationFn: () =>
      requestWithdrawal({
        data: {
          amount: Number(amount),
          method,
          account_number: accountNumber,
          account_name: accountName,
          idempotency_key: crypto.randomUUID(),
        },
      }),
    onSuccess: () => {
      toast.success("Permintaan penarikan dikirim. Menunggu review admin.");
      setAmount("");
      qc.invalidateQueries();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Saldo & Penarikan"
        subtitle="Ajukan pencairan dan pantau mutasi saldo."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <NeoCard className="bg-primary text-primary-foreground">
          <p className="font-display text-[11px] font-bold uppercase tracking-widest">
            Saldo Tersedia
          </p>
          <p className="neo-heading mt-1 text-2xl">{formatRp(boot?.balance.available ?? 0)}</p>
        </NeoCard>
        <NeoCard>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
            Estimasi Pending
          </p>
          <p className="neo-heading mt-1 text-2xl">{formatRp(boot?.balance.pending ?? 0)}</p>
        </NeoCard>
        <NeoCard>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest opacity-70">
            Minimal Tarik
          </p>
          <p className="neo-heading mt-1 text-2xl">
            {formatRp(boot?.settings.min_withdrawal ?? 0)}
          </p>
        </NeoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <NeoCard>
          <h2 className="neo-heading text-lg">Ajukan Penarikan</h2>
          <form
            className="mt-3 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div>
              <NeoLabel>Nominal (Rp)</NeoLabel>
              <NeoInput
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                required
              />
            </div>
            <div>
              <NeoLabel>Metode</NeoLabel>
              <NeoSelect value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="DANA">DANA</option>
                <option value="OVO">OVO</option>
                <option value="GOPAY">GoPay</option>
                <option value="BANK">Transfer Bank</option>
              </NeoSelect>
            </div>
            <div>
              <NeoLabel>Nomor Tujuan</NeoLabel>
              <NeoInput
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="08xxxxxxxxxx / nomor rekening"
                required
              />
            </div>
            <div>
              <NeoLabel>Nama Penerima</NeoLabel>
              <NeoInput
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Nama sesuai rekening"
                required
              />
            </div>
            <NeoButton type="submit" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? "Mengirim..." : "Ajukan Penarikan"}
            </NeoButton>
          </form>
        </NeoCard>

        <div className="space-y-4">
          <NeoCard>
            <h2 className="neo-heading text-lg">Riwayat Penarikan</h2>
            <div className="mt-3 space-y-2">
              {(withdrawals.data ?? []).length === 0 ? (
                <EmptyState text="Belum ada penarikan" />
              ) : (
                (withdrawals.data ?? []).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between gap-2 rounded-md border-[3px] border-ink bg-card px-3 py-2 shadow-neo-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold">{formatRp(w.amount)}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {w.method} • {new Date(w.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <NeoBadge tone={toneOf(w.status)}>{w.status}</NeoBadge>
                  </div>
                ))
              )}
            </div>
          </NeoCard>

          <NeoCard>
            <h2 className="neo-heading text-lg">Mutasi Saldo</h2>
            <div className="mt-3 space-y-2">
              {(txns.data ?? []).length === 0 ? (
                <EmptyState text="Belum ada mutasi" />
              ) : (
                (txns.data ?? []).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-2 border-b-2 border-ink/15 pb-1.5 text-sm font-semibold"
                  >
                    <span className="min-w-0 truncate">
                      {t.description ?? t.type}
                      <span className="block text-xs font-medium text-muted-foreground">
                        {new Date(t.created_at).toLocaleString("id-ID")}
                      </span>
                    </span>
                    <span className={t.amount < 0 ? "text-destructive" : ""}>
                      {t.amount < 0 ? "-" : "+"}
                      {formatRp(Math.abs(t.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>
          </NeoCard>
        </div>
      </div>
    </div>
  );
}
