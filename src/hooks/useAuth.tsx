import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (next) {
        setSession(next);
      } else {
        const stored = localStorage.getItem("app_user_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.access_token) {
              setSession(parsed);
            } else {
              setSession(null);
            }
          } catch {
            setSession(null);
          }
        } else {
          setSession(null);
        }
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
      } else {
        const stored = localStorage.getItem("app_user_session");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.access_token) {
              setSession(parsed);
            }
          } catch {
            // Ignore
          }
        }
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, loading };
}
