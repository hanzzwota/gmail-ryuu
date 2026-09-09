import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      amount: number;
      method: string;
      account_number: string;
      account_name: string;
      idempotency_key: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const [settingsRes, ledgerRes, pendingRes, profileRes] = await Promise.all([
      supabase.from("settings").select("min_withdrawal").eq("id", 1).maybeSingle(),
      supabase.from("balance_transactions").select("amount").eq("user_id", userId),
      supabase
        .from("withdrawals")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["PENDING", "APPROVED", "PROCESSING"]),
      supabase.from("profiles").select("suspended").eq("id", userId).maybeSingle(),
    ]);

    if (profileRes.data?.suspended) throw new Error("Akun Anda sedang ditangguhkan.");

    const min = settingsRes.data?.min_withdrawal ?? 4000;
    const amount = Math.floor(Number(data.amount));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Nominal tidak valid.");
    if (amount < min) throw new Error(`Minimal penarikan Rp ${min.toLocaleString("id-ID")}.`);
    if ((pendingRes.data ?? []).length > 0)
      throw new Error("Masih ada penarikan yang sedang diproses.");

    const available = (ledgerRes.data ?? []).reduce((sum, t) => sum + t.amount, 0);
    if (amount > available) throw new Error("Saldo tidak mencukupi.");

    if (!data.account_number.trim() || !data.account_name.trim())
      throw new Error("Data tujuan penarikan wajib diisi.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("withdrawals")
      .select("id")
      .eq("idempotency_key", data.idempotency_key)
      .maybeSingle();
    if (existing) return { ok: true, id: existing.id };

    const { data: created, error } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        user_id: userId,
        amount,
        method: data.method,
        account_number: data.account_number.trim(),
        account_name: data.account_name.trim(),
        idempotency_key: data.idempotency_key,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("balance_transactions").insert({
      user_id: userId,
      type: "RESERVE",
      amount: -amount,
      description: `Penarikan ${data.method}`,
      ref_id: created.id,
    });

    return { ok: true, id: created.id };
  });
