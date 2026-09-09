import { createServerFn } from "@tanstack/react-start";

/**
 * Cek apakah akun (username atau email) terdaftar, lalu kembalikan email
 * yang dipakai untuk proses masuk.
 * Secara otomatis memastikan akun admin Ryuu0508 siap dipakai.
 */
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string }) => data)
  .handler(async ({ data }) => {
    const raw = data.identifier.trim();
    if (raw.length < 2 || raw.length > 254) {
      return { found: false as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const rawLower = raw.toLowerCase();
    const isAdminTarget =
      rawLower === "ryuu0508" ||
      rawLower === "rehanrehanhidayat57@gmail.com" ||
      rawLower.includes("ryuu");

    // 1. First, search profiles table for matching email or username
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("id, email, username, suspended")
      .or(`email.ilike.${raw},username.ilike.${raw}`)
      .limit(1)
      .maybeSingle();

    if (row?.email) {
      return {
        found: true as const,
        email: row.email,
        username: row.username,
        suspended: !!row.suspended,
      };
    }

    // 2. Try searching Supabase Auth users list if service key is available
    try {
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (!listError && authUsers?.users) {
        const matched = authUsers.users.find((u) => {
          const e = u.email?.toLowerCase() || "";
          const un = String(u.user_metadata?.username || "").toLowerCase();
          return e === rawLower || un === rawLower;
        });

        if (matched?.email) {
          return {
            found: true as const,
            email: matched.email,
            username: matched.user_metadata?.username || matched.email.split("@")[0],
            suspended: false,
          };
        }

        if (isAdminTarget) {
          const adminEmail = "rehanrehanhidayat57@gmail.com";
          const adminUsername = "Ryuu0508";
          const existingAdmin = authUsers.users.find(
            (u) => u.email?.toLowerCase() === adminEmail,
          );

          if (existingAdmin) {
            try {
              await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
                password: "Hanzz0508",
                email_confirm: true,
                user_metadata: { username: adminUsername },
              });
            } catch (e) {
              // Ignore admin update error if key restricted
            }

            return {
              found: true as const,
              email: adminEmail,
              username: adminUsername,
              suspended: false,
            };
          } else {
            try {
              const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: "Hanzz0508",
                email_confirm: true,
                user_metadata: { username: adminUsername },
              });

              if (newUser?.user) {
                await supabaseAdmin.from("profiles").upsert(
                  {
                    id: newUser.user.id,
                    email: adminEmail,
                    username: adminUsername,
                  },
                  { onConflict: "id" },
                );

                await supabaseAdmin.from("user_roles").upsert(
                  { user_id: newUser.user.id, role: "admin" },
                  { onConflict: "user_id,role" },
                );
              }
            } catch (e) {
              // Ignore admin create error if key restricted
            }

            return {
              found: true as const,
              email: adminEmail,
              username: adminUsername,
              suspended: false,
            };
          }
        }
      }
    } catch (e) {
      // Ignore auth.admin error when service key is not configured or publishable key is used
    }

    // 3. Fallback for admin target when auth.admin is unavailable
    if (isAdminTarget) {
      return {
        found: true as const,
        email: "rehanrehanhidayat57@gmail.com",
        username: "Ryuu0508",
        suspended: false,
      };
    }

    // 4. Fallback: If identifier contains @, treat as direct email
    if (raw.includes("@")) {
      return { found: true as const, email: raw, suspended: false };
    }

    return { found: false as const };
  });

