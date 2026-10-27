import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Practice } from "@/types/practice";

const GENERIC_ERROR = "An unexpected error occurred. Please try again.";

const sphereSchema = z.object({ sphere_id: z.string() });

export const getPracticesForSphere = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sphereSchema.parse(input))
  .handler(async ({ context, data }): Promise<Practice[]> => {
    const { supabase } = context;
    const { data: rows, error } = await (supabase as any)
      .from("practices")
      .select("*")
      .eq("sphere_id", data.sphere_id)
      .order("type");

    if (error) {
      console.error("[practices] getPracticesForSphere error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return (rows ?? []) as Practice[];
  });

const completionSchema = z.object({
  practice_id: z.string(),
  journey_id: z.string().nullable(),
  context: z.enum(["journey", "daily"]),
  skipped: z.boolean(),
});

export const recordPracticeCompletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => completionSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase as any).from("practice_completions").insert({
      user_id: userId,
      practice_id: data.practice_id,
      journey_id: data.journey_id,
      context: data.context,
      skipped: data.skipped,
    });
    if (error) {
      console.error("[practices] recordPracticeCompletion error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return { ok: true };
  });
