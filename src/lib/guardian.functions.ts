import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export interface Guardian {
  id: string;
  user_id: string;
  sphere_id: string;
  name: string;
  silhouette_id: string;
  color_primary: string;
  color_secondary: string | null;
  created_at: string;
}

const saveGuardianSchema = z.object({
  sphere_id: z.string(),
  name: z.string().min(1).max(40),
  silhouette_id: z.string(),
  color_primary: z.string(),
  color_secondary: z.string().optional(),
});

export const saveGuardian = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => saveGuardianSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: guardian, error } = await supabase
      .from("sphere_guardians")
      .upsert(
        {
          user_id: userId,
          sphere_id: data.sphere_id,
          name: data.name,
          silhouette_id: data.silhouette_id,
          color_primary: data.color_primary,
          color_secondary: data.color_secondary ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,sphere_id" },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return guardian as Guardian;
  });

export const getGuardians = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("sphere_guardians")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");

    if (error) throw new Error(error.message);
    return (data ?? []) as Guardian[];
  });

const getGuardianSchema = z.object({ sphere_id: z.string() });

export const getGuardianForSphere = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => getGuardianSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: guardian } = await supabase
      .from("sphere_guardians")
      .select("*")
      .eq("user_id", userId)
      .eq("sphere_id", data.sphere_id)
      .maybeSingle();

    return guardian as Guardian | null;
  });
