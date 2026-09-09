import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Send } from "lucide-react";
import {
  NeoCard,
  NeoBadge,
  NeoButton,
  NeoInput,
  NeoLabel,
  NeoSelect,
  NeoTextarea,
  SectionTitle,
  EmptyState,
} from "@/components/neo";
import {
  askSupportAi,
  createTicket,
  listFaqs,
  listTickets,
  replyTicket,
} from "@/lib/support.functions";

export const Route = createFileRoute("/_authenticated/support")({
  head: () => ({
    meta: [
      { title: "Support AI — S3L RYU88 GMAIL" },
      { name: "description", content: "Tanya Carsloss Support AI atau buka tiket ke admin." },
      { property: "og:title", content: "Support AI — S3L RYU88 GMAIL" },
      { property: "og:description", content: "Bantuan cepat lewat AI atau tiket admin." },
    ],
  }),
  component: SupportPage,
});

type Chat = { role: "user" | "ai"; text: string };

function SupportPage() {
  const qc = useQueryClient();
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<Chat[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("UMUM");
  const [body, setBody] = useState("");
  const [reply, setReply] = useState<Record<string, string>>({});

  const faqs = useQuery({ queryKey: ["faqs"], queryFn: () => listFaqs() });
  const tickets = useQuery({ queryKey: ["tickets"], queryFn: () => listTickets() });

  const ask = useMutation({
    mutationFn: (q: string) => askSupportAi({ data: { question: q } }),
    onSuccess: (res: { answer: string }) =>
      setChat((c) => [...c, { role: "ai", text: res.answer }]),
    onError: (err: Error) => toast.error(err.message),
  });

  const newTicket = useMutation({
    mutationFn: () => createTicket({ data: { subject, category, body } }),
    onSuccess: () => {
      toast.success("Tiket terkirim ke admin.");
      setSubject("");
      setBody("");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendReply = useMutation({
    mutationFn: (vars: { ticket_id: string; body: string }) => replyTicket({ data: vars }),
    onSuccess: () => {
      toast.success("Balasan terkirim.");
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-5">
      <SectionTitle title="Support" subtitle="Tanya AI kapan saja, atau buka tiket ke admin." />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <NeoCard>
          <h2 className="neo-heading flex items-center gap-2 text-lg">
            <Bot className="size-5" /> Carsloss Support AI
          </h2>
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {chat.length === 0 ? (
              <EmptyState text="Ajukan pertanyaan pertama Anda" />
            ) : (
              chat.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-md border-[3px] border-ink bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-neo-sm"
                      : "max-w-[85%] rounded-md border-[3px] border-ink bg-card px-3 py-2 text-sm font-medium shadow-neo-sm"
                  }
                >
                  {m.text}
                </div>
              ))
            )}
            {ask.isPending ? (
              <p className="font-display text-xs font-bold uppercase">Mengetik...</p>
            ) : null}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!question.trim()) return;
              setChat((c) => [...c, { role: "user", text: question }]);
              ask.mutate(question);
              setQuestion("");
            }}
          >
            <NeoInput
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Contoh: kapan saldo dibayar?"
            />
            <NeoButton type="submit" disabled={ask.isPending}>
              <Send className="size-4" />
            </NeoButton>
          </form>
        </NeoCard>

        <NeoCard>
          <h2 className="neo-heading text-lg">Buka Tiket Admin</h2>
          <form
            className="mt-3 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              newTicket.mutate();
            }}
          >
            <div>
              <NeoLabel>Judul</NeoLabel>
              <NeoInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ringkas masalah Anda"
                required
              />
            </div>
            <div>
              <NeoLabel>Kategori</NeoLabel>
              <NeoSelect value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="UMUM">Umum</option>
                <option value="SETORAN">Setoran</option>
                <option value="SALDO">Saldo</option>
                <option value="PENARIKAN">Penarikan</option>
                <option value="AKUN">Akun</option>
              </NeoSelect>
            </div>
            <div>
              <NeoLabel>Pesan</NeoLabel>
              <NeoTextarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Jelaskan detailnya"
                required
              />
            </div>
            <NeoButton type="submit" disabled={newTicket.isPending}>
              {newTicket.isPending ? "Mengirim..." : "Kirim Tiket"}
            </NeoButton>
          </form>
        </NeoCard>
      </div>

      <NeoCard>
        <h2 className="neo-heading text-lg">Tiket Saya</h2>
        <div className="mt-3 space-y-3">
          {(tickets.data ?? []).length === 0 ? (
            <EmptyState text="Belum ada tiket" />
          ) : (
            (tickets.data ?? []).map((t) => (
              <div
                key={t.id}
                className="rounded-md border-[3px] border-ink bg-card p-3 shadow-neo-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-sm font-bold">{t.subject}</p>
                  <NeoBadge tone={t.status === "CLOSED" ? "neutral" : "info"}>{t.status}</NeoBadge>
                </div>
                <div className="mt-2 space-y-1.5">
                  {(t.support_messages ?? [])
                    .slice()
                    .sort((a, b) => a.created_at.localeCompare(b.created_at))
                    .map((m) => (
                      <p
                        key={m.id}
                        className={
                          m.is_admin
                            ? "rounded border-2 border-ink bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground"
                            : "rounded border-2 border-ink/30 px-2 py-1 text-xs font-medium"
                        }
                      >
                        {m.body}
                      </p>
                    ))}
                </div>
                {t.status !== "CLOSED" ? (
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = reply[t.id]?.trim();
                      if (!text) return;
                      sendReply.mutate({ ticket_id: t.id, body: text });
                      setReply((r) => ({ ...r, [t.id]: "" }));
                    }}
                  >
                    <NeoInput
                      value={reply[t.id] ?? ""}
                      onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))}
                      placeholder="Tulis balasan"
                    />
                    <NeoButton type="submit" size="sm">
                      Kirim
                    </NeoButton>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </div>
      </NeoCard>

      <NeoCard>
        <h2 className="neo-heading text-lg">FAQ</h2>
        <div className="mt-3 space-y-2">
          {(faqs.data ?? []).map((f) => (
            <details
              key={f.id}
              className="rounded-md border-[3px] border-ink bg-card p-3 shadow-neo-sm"
            >
              <summary className="cursor-pointer font-display text-sm font-bold">
                {f.question}
              </summary>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </NeoCard>
    </div>
  );
}
