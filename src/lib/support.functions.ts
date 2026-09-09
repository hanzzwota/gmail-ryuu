import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listFaqs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("support_tickets")
      .select("*, support_messages(*)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const COOLDOWN_MS = 15 * 60 * 1000;

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { subject: string; category: string; body: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const settings = await supabase
      .from("settings")
      .select("human_support_enabled")
      .eq("id", 1)
      .maybeSingle();
    if (!settings.data?.human_support_enabled)
      throw new Error("Support manusia sedang dinonaktifkan admin.");

    if (!data.subject.trim() || !data.body.trim())
      throw new Error("Judul dan isi pesan wajib diisi.");

    const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: recent } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", since)
      .limit(1);
    if ((recent ?? []).length > 0)
      throw new Error("Mohon tunggu 15 menit sebelum mengirim tiket baru.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject: data.subject.trim().slice(0, 120),
        category: data.category,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      is_admin: false,
      body: data.body.trim().slice(0, 2000),
    });

    return { ok: true, id: ticket.id };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ticket_id: string; body: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id, user_id, status")
      .eq("id", data.ticket_id)
      .maybeSingle();
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!ticket || (ticket.user_id !== userId && isAdmin !== true))
      throw new Error("Tiket tidak ditemukan.");
    if (!data.body.trim()) throw new Error("Pesan kosong.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      is_admin: isAdmin === true,
      body: data.body.trim().slice(0, 2000),
    });
    await supabaseAdmin
      .from("support_tickets")
      .update({
        status: isAdmin === true ? "ANSWERED" : "OPEN",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticket.id);
    return { ok: true };
  });

export const askSupportAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { question: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [settingsRes, faqRes] = await Promise.all([
      supabase
        .from("settings")
        .select("rate_per_account, daily_quota, min_withdrawal, submission_open, ai_faq_enabled")
        .eq("id", 1)
        .maybeSingle(),
      supabase.from("faqs").select("question, answer").order("sort_order"),
    ]);

    const faqs = faqRes.data ?? [];
    const question = data.question.trim().slice(0, 500);
    if (!question) throw new Error("Pertanyaan kosong.");

    const fallback = () => {
      const q = question.toLowerCase();
      const hit = faqs.find((f) =>
        q.split(/\s+/).some((word) => word.length > 3 && f.question.toLowerCase().includes(word)),
      );
      return (
        hit?.answer ??
        "Maaf, saya belum menemukan jawabannya. Silakan buka tiket support agar admin membantu Anda."
      );
    };

    if (settingsRes.data?.ai_faq_enabled === false) return { answer: fallback(), source: "faq" };

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { answer: fallback(), source: "faq" };

    const context_text = [
      `Rate per akun: Rp ${settingsRes.data?.rate_per_account ?? 0}`,
      `Kuota harian: ${settingsRes.data?.daily_quota ?? 0}`,
      `Minimal withdraw: Rp ${settingsRes.data?.min_withdrawal ?? 0}`,
      `Status setoran: ${settingsRes.data?.submission_open ? "DIBUKA" : "DITUTUP"}`,
      "FAQ:",
      ...faqs.map((f) => `- ${f.question} => ${f.answer}`),
    ].join("\n");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah Carsloss Support AI untuk platform S3L RYU88 GMAIL. Jawab dalam Bahasa Indonesia, singkat, ramah, maksimal 4 kalimat. Jawab HANYA berdasarkan data berikut. JANGAN PERNAH meminta password, OTP, kode pemulihan, cookie sesi, atau kredensial pihak ketiga apa pun; jika ditanya soal itu, tolak dengan tegas.\n\n" +
                context_text,
            },
            { role: "user", content: question },
          ],
        }),
      });
      if (!res.ok) return { answer: fallback(), source: "faq" };
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const answer = json.choices?.[0]?.message?.content?.trim();
      return answer ? { answer, source: "ai" } : { answer: fallback(), source: "faq" };
    } catch {
      return { answer: fallback(), source: "faq" };
    }
  });
