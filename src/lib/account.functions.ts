import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Bootstrap = {
  profile: {
    id: string;
    username: string;
    email: string | null;
    whatsapp: string | null;
    payment_method: string | null;
    payment_account: string | null;
    suspended: boolean;
  } | null;
  isAdmin: boolean;
  settings: {
    dashboard_name: string;
    rate_per_account: number;
    daily_quota: number;
    max_bulk: number;
    min_withdrawal: number;
    submission_open: boolean;
    whatsapp_link: string;
    tiktok_link: string;
    announcement: string;
    announcement_title: string;
    rules_today: string;
    human_support_enabled: boolean;
    ai_faq_enabled: boolean;
  };
  balance: {
    available: number;
    pending: number;
    totalEarned: number;
    totalWithdrawn: number;
  };
  quota: { used: number; limit: number; remaining: number };
  stats: { accepted: number; pending: number; rejected: number; total: number };
};

export const getBootstrap = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Bootstrap> => {
    const { supabase, userId } = context;

    const [profileRes, roleRes, settingsRes, ledgerRes, subsRes, paidRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("balance_transactions").select("type, amount").eq("user_id", userId),
      supabase.from("submissions").select("status, rate, created_at").eq("user_id", userId),
      supabase.from("withdrawals").select("amount").eq("user_id", userId).eq("status", "PAID"),
    ]);

    const ledger = ledgerRes.data ?? [];
    const available = ledger.reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = ledger
      .filter((t) => t.type === "CREDIT")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = (paidRes.data ?? []).reduce((sum, w) => sum + w.amount, 0);

    const subs = subsRes.data ?? [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const used = subs.filter((s) => new Date(s.created_at) >= today).length;
    const pendingSubs = subs.filter((s) => s.status === "PENDING");

    const settings = settingsRes.data;
    const limit = settings?.daily_quota ?? 0;
    const remaining = limit > 0 ? Math.max(0, limit - used) : 999999;

    let profile = profileRes.data;
    if (!profile) {
      const isDefaultAdmin =
        userId === "admin-ryuu0508-id" ||
        context.user?.email?.toLowerCase() === "rehanrehanhidayat57@gmail.com";

      profile = {
        id: userId,
        username: isDefaultAdmin ? "Ryuu0508" : (context.user?.email?.split("@")[0] || "Pengguna"),
        email: context.user?.email || (isDefaultAdmin ? "rehanrehanhidayat57@gmail.com" : null),
        whatsapp: null,
        payment_method: null,
        payment_account: null,
        suspended: false,
      };

      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("profiles").upsert(
          {
            id: userId,
            email: profile.email,
            username: profile.username,
          },
          { onConflict: "id" }
        );
      } catch (e) {
        console.warn("Auto profile creation warning:", e);
      }
    }

    let isAdmin = roleRes.data === true || userId === "admin-ryuu0508-id";

    const uname = profile.username?.toLowerCase() ?? "";
    const uemail = profile.email?.toLowerCase() ?? "";
    if (
      !isAdmin &&
      (uname === "ryuu0508" ||
        uemail.includes("ryuu") ||
        uemail === "rehanrehanhidayat57@gmail.com")
    ) {
      isAdmin = true;
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("user_roles").upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role" }
        );
      } catch (e) {
        console.error("Auto admin upsert failed:", e);
      }
    }

    return {
      profile,
      isAdmin,
      settings: {
        dashboard_name: settings?.dashboard_name || "S3L RYU88 GMAIL",
        rate_per_account: settings?.rate_per_account ?? 1500,
        daily_quota: limit,
        max_bulk: settings?.max_bulk ?? 0,
        min_withdrawal: settings?.min_withdrawal ?? 4000,
        submission_open: settings?.submission_open ?? true,
        deposit_password: settings?.deposit_password || "sgsg1122",
        whatsapp_link: settings?.whatsapp_link || "https://whatsapp.com",
        tiktok_link: settings?.tiktok_link || "https://tiktok.com",
        announcement:
          settings?.announcement ||
          "Halo kawan-kawan! Harap perhatikan rules hari ini sebelum melakukan stor akun. Pastikan akun aktif, tidak duplikat, dan ikuti instruksi admin. Terima kasih!",
        announcement_title: settings?.announcement_title || "PENGUMUMAN RESMI ADMIN",
        rules_today:
          settings?.rules_today ||
          "1. Wajib akun Gmail aktif dan bisa login.\n2. Tulis satu email Gmail per baris.\n3. Dilarang menyetor akun duplikat atau bekas.\n4. Admin berhak menolak akun yang melanggar aturan.",
        human_support_enabled: settings?.human_support_enabled ?? true,
        ai_faq_enabled: settings?.ai_faq_enabled ?? true,
      },
      balance: {
        available,
        pending: pendingSubs.reduce((sum, s) => sum + s.rate, 0),
        totalEarned,
        totalWithdrawn,
      },

      quota: { used, limit, remaining },
      stats: {
        accepted: subs.filter((s) => s.status === "ACCEPTED").length,
        pending: pendingSubs.length,
        rejected: subs.filter((s) => s.status === "REJECTED").length,
        total: subs.length,
      },
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      username: string;
      whatsapp: string;
      payment_method: string;
      payment_account: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.username.trim()) throw new Error("Nama pengguna wajib diisi.");
    const { error } = await supabase
      .from("profiles")
      .update({
        username: data.username.trim(),
        whatsapp: data.whatsapp.trim() || null,
        payment_method: data.payment_method.trim() || null,
        payment_account: data.payment_account.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("balance_transactions")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
