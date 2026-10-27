import { createServerFn } from "@tanstack/react-start";

export const getAppConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    isPremiumApp: process.env.IS_PREMIUM_APP === "true",
  };
});
