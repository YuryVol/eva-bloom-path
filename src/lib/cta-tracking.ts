import { supabase } from "@/integrations/supabase/client";

type CTAEvent = {
  context: string;
  format: "a" | "b" | "c";
  event_type: "shown" | "clicked";
};

export async function trackCTAEvent(event: CTAEvent): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("premium_cta_events").insert({
    user_id: data.user.id,
    context: event.context,
    format: event.format,
    event_type: event.event_type,
  });
}
