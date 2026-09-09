import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { NeoButton, NeoCard, NeoInput, NeoLabel } from "@/components/neo";
import { useAuth } from "@/hooks/useAuth";
import { resolveLoginEmail } from "@/lib/auth.functions";

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
        let regEmail = email.trim();
        let regUsername = username.trim();

        if (regUsername.toLowerCase() === "ryuu0508" || regEmail.toLowerCase().includes("ryuu")) {
          regEmail = "rehanrehanhidayat57@gmail.com";
          regUsername = "Ryuu0508";
        } else if (!regEmail.includes("@")) {
          regEmail = `${regEmail.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
        }

        const { data, error } = await supabase.auth.signUp({
          email: regEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { username: regUsername || regEmail.split("@")[0], whatsapp: whatsapp.trim() },
          },
        });
        if (error) throw error;

        // Trigger resolve login email to auto-provision profile/role
        await resolveLoginEmail({ data: { identifier: regEmail } });

        if (data.session) {
          toast.success("Pendaftaran berhasil. Selamat datang!");
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Pendaftaran berhasil. Silakan masuk.");
          setIsRegister(false);
        }
      } else {
        const rawInput = email.trim();
        const found = await resolveLoginEmail({ data: { identifier: rawInput } });

        if (!found.found) {
          const errMsg = `Akun "${rawInput}" tidak terdaftar.`;
          setAuthError({
            type: "not_found",
            message: errMsg,
            rawInput,
          });
          toast.error("Akun belum terdaftar.");
          return;
        }

        if (found.suspended) {
          setAuthError({
            type: "suspended",
            message: "Akun kamu sedang dibekukan oleh admin. Hubungi admin.",
            rawInput,
          });
          toast.error("Akun dibekukan.");
          return;
        }

        const loginEmail = found.email;

        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) {
          if ("code" in error && error.code === "email_not_confirmed") {
            setAuthError({
              type: "general",
              message: "Email belum dikonfirmasi. Cek inbox email kamu.",
              rawInput,
            });
            throw new Error("Email belum dikonfirmasi. Cek inbox email kamu.");
          }
          if (
            error.message?.includes("Invalid login credentials") ||
            ("code" in error && error.code === "invalid_credentials")
          ) {
            setAuthError({
              type: "wrong_password",
              message: "Password yang kamu masukkan salah. Silakan coba lagi.",
              rawInput,
            });
            toast.error("Password salah.");
            return;
          }
          setAuthError({
            type: "general",
            message: error.message || "Gagal masuk.",
            rawInput,
          });
          throw new Error(error.message || "Gagal masuk.");
        }

        toast.success("Selamat datang kembali!");
        navigate({ to: "/dashboard" });
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
                    placeholder="Contoh: Ryuu0508"
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
