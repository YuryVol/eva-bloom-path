import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GENERIC_ERROR = "An unexpected error occurred. Please try again.";

export const getOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("[onboarding] select error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return { onboarding: data };
  });

const upsertSchema = z.object({
  intro_seen: z.boolean().optional(),
  disclaimer_seen: z.boolean().optional(),
  user_name: z.string().trim().min(1).max(80).optional(),
  user_age: z.number().int().min(0).max(120).optional(),
  user_roles: z.array(z.string().min(1).max(60)).max(10).optional(),
  auth_type: z.enum(["guest", "google"]).optional(),
  completed: z.boolean().optional(),
});

export const upsertOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("onboarding_progress")
      .upsert({ user_id: userId, ...data }, { onConflict: "user_id" });
    if (error) {
      console.error("[onboarding] upsert error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return { ok: true };
  });

