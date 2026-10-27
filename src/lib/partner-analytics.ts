import { supabase } from "@/integrations/supabase/client";

export async function trackPartnerEvent(params: {
  user_id: string;
  partner_slug: string;
  sphere_id: string;
  event_type: "shown" | "clicked" | "dismissed";
  journey_id: string;
  coins_balance: number;
}): Promise<void> {
  const { error } = await supabase.from("partner_events").insert({
    user_id: params.user_id,
    partner_slug: params.partner_slug,
    sphere_id: params.sphere_id,
    event_type: params.event_type,
    journey_id: params.journey_id,
    coins_balance: params.coins_balance,
  });
  if (error) console.warn("[partner-analytics] insert failed:", error.message);

  if (params.event_type === "clicked") {
    await supabase
      .from("journeys")
      .update({ partner_clicked: true })
      .eq("id", params.journey_id);
  }

  if (params.event_type === "shown") {
    await supabase
      .from("journeys")
      .update({ partner_shown: true })
      .eq("id", params.journey_id);
  }
}
