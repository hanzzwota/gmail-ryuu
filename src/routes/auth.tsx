import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { NeoButton, NeoCard, NeoInput, NeoLabel } from "@/components/neo";
import { useAuth } from "@/hooks/useAuth";
import { resolveLoginEmail, serverLogin, serverRegister } from "@/lib/auth.functions";

type AuthSearch = { mode?: "login" | "register" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search["mode"] === "register" ? "register" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Masuk atau Daftar — S3L RYU88 GMAIL" },
      {
        name: "description",
        content: "Masuk ke dashboard S3L RYU88 GMAIL untuk stor akun, cek saldo, dan tarik dana.",
      },
      { property: "og:title", content: "Masuk atau Daftar — S3L RYU88 GMAIL" },
      {
        property: "og:description",
        content: "Akses dashboard setoran, saldo, dan penarikan S3L RYU88 GMAIL.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<{
    type: "not_found" | "wrong_password" | "suspended" | "general";
    message: string;
    rawInput?: string;
  } | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard", replace: true });
  }, [loading, session, navigate]);

  const handleGoToRegister = () => {
    const raw = (authError?.rawInput || email).trim();
    if (raw.includes("@")) {
      setEmail(raw);
      setUsername(raw.split("@")[0]);
    } else if (raw) {
      setUsername(raw);
      setEmail(`${raw.toLowerCase().replace(/\s+/g, "")}@gmail.com`);
    }
    setIsRegister(true);
    setAuthError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError(null);

    try {
      if (isRegister) {
        const res = await serverRegister({
          data: {
            email: email.trim(),
            password,
            username: username.trim(),
            whatsapp: whatsapp.trim(),
          },
        });

        if (!res.success) {
          toast.error(res.message);
          return;
        }

        if (res.session) {
          try {
            document.cookie = `sb-access-token=${res.session.access_token}; path=/; max-age=2592000; SameSite=Lax`;
            localStorage.setItem("sb-access-token", res.session.access_token);
            localStorage.setItem("app_user_session", JSON.stringify(res.session));
            await supabase.auth.setSession({
              access_token: res.session.access_token,
              refresh_token: res.session.refresh_token,
            });
          } catch (err) {
            console.warn("Client setSession warning:", err);
          }
        }

        toast.success("Pendaftaran berhasil. Selamat datang!");
        window.location.href = "/dashboard";
      } else {
        const rawInput = email.trim();
        const res = await serverLogin({
          data: {
            identifier: rawInput,
            password,
          },
        });

        if (!res.success) {
          setAuthError({
            type: (res.errorType as "not_found" | "wrong_password" | "suspended") || "general",
            message: res.message || "Gagal masuk.",
            rawInput,
          });
          toast.error(res.message || "Gagal masuk.");
          return;
        }

        if (res.session) {
          try {
            document.cookie = `sb-access-token=${res.session.access_token}; path=/; max-age=2592000; SameSite=Lax`;
            localStorage.setItem("sb-access-token", res.session.access_token);
            localStorage.setItem("app_user_session", JSON.stringify(res.session));
            await supabase.auth.setSession({
              access_token: res.session.access_token,
              refresh_token: res.session.refresh_token,
            });
          } catch (err) {
            console.warn("Client setSession warning:", err);
          }
        }

        toast.success(`Selamat datang kembali, ${res.username || "Admin"}!`);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="neo-heading mb-5 block text-center text-xl">
          S3L RYU88 GMAIL
        </Link>
        <NeoCard className="border-[4px] p-6 shadow-neo-lg">
          <h1 className="neo-heading text-2xl">{isRegister ? "Daftar Akun" : "Masuk"}</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {isRegister
              ? "Buat akun untuk mulai menyetor."
              : "Masuk untuk melanjutkan ke dashboard."}
          </p>

          {/* Alert box when login fails or account is not registered */}
          {authError && !isRegister ? (
            <div className="mt-4 rounded-md border-[3px] border-ink bg-amber-100 p-3.5 text-xs font-bold text-amber-950 shadow-neo-sm dark:bg-amber-950/80 dark:text-amber-100">
              <p className="leading-relaxed">
                ⚠️ {authError.message}
                {authError.type === "not_found" ? (
                  <>
                    {" "}
                    Silakan{" "}
                    <button
                      type="button"
                      onClick={handleGoToRegister}
                      className="font-black text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
                    >
                      Daftar Sekarang
                    </button>
                  </>
                ) : null}
              </p>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-4 space-y-3">
            {isRegister ? (
              <>
                <div>
                  <NeoLabel>Nama Pengguna (Username)</NeoLabel>
                  <NeoInput
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: user123"
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
              </>
            ) : null}
            <div>
              <NeoLabel>{isRegister ? "Email Aktif" : "Username / Gmail"}</NeoLabel>
              <NeoInput
                type={isRegister ? "email" : "text"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder={isRegister ? "contoh@gmail.com" : "Username atau Email"}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <NeoLabel>Password</NeoLabel>
              <NeoInput
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
            </div>
            <NeoButton type="submit" size="lg" className="w-full" disabled={busy || !ready}>
              {busy || !ready ? "Memproses..." : isRegister ? "Daftar Sekarang" : "Masuk"}
            </NeoButton>
          </form>

          <button
            type="button"
            onClick={() => {
              setIsRegister((v) => !v);
              setAuthError(null);
            }}
            className="mt-4 w-full text-center text-sm font-bold underline"
          >
            {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
          </button>
        </NeoCard>

        <p className="mt-4 text-center text-xs font-bold uppercase text-muted-foreground">
          Setorkan Gmail Mu Sekarang Juga
        </p>
      </div>
    </div>
  );
}
