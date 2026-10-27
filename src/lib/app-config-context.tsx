import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAppConfig } from "./app-config";

interface AppConfig {
  isPremiumApp: boolean;
  loaded: boolean;
}

const AppConfigContext = createContext<AppConfig>({ isPremiumApp: false, loaded: false });

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const fetchConfig = useServerFn(getAppConfig);
  const [config, setConfig] = useState<AppConfig>({ isPremiumApp: false, loaded: false });

  useEffect(() => {
    fetchConfig()
      .then((cfg) => setConfig({ isPremiumApp: cfg.isPremiumApp, loaded: true }))
      .catch(() => setConfig({ isPremiumApp: false, loaded: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
