import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function generateToken(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (const byte of array) token += chars[byte % chars.length];
  return token;
}

export const generateTgToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const token = generateToken(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("profiles")
      .update({
        tg_link_token: token,
        tg_link_token_expires_at: expiresAt,
      } as never)
      .eq("id", userId);

    if (error) throw new Error("Failed to generate token");

    return { token };
  });
