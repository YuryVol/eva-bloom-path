import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useJourneyStore } from "@/lib/journey-store";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { MusicToggle } from "@/components/eva/MusicToggle";
import { AmbientPlayer } from "@/components/eva/AmbientPlayer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground text-glow">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Эта страница потерялась в шуме.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          На главную
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ЕВА — тихий путь к себе" },
      { name: "description", content: "Веб-приложение для мягкого контакта с собой" },
      { property: "og:title", content: "ЕВА — тихий путь к себе" },
      { property: "og:description", content: "Веб-приложение для мягкого контакта с собой" },
      { name: "twitter:title", content: "ЕВА — тихий путь к себе" },
      { name: "twitter:description", content: "Веб-приложение для мягкого контакта с собой" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/vfQWt7c3h8MHAI24XlTFApvrwnR2/social-images/social-1779603163195-Заставка.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/vfQWt7c3h8MHAI24XlTFApvrwnR2/social-images/social-1779603163195-Заставка.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      router.invalidate();
      qc.invalidateQueries();
      if (event === "SIGNED_OUT") {
        useJourneyStore.getState().reset();
        useOnboardingDraft.getState().reset();
      }
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <Toaster theme="dark" position="top-center" />
      <AmbientPlayer />
      <MusicToggle />
      <Outlet />
    </QueryClientProvider>
  );
}
