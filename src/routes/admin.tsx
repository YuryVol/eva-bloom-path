import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkAdminRole } from "@/lib/admin.functions";
import { AmbientBackground } from "@/components/eva/AmbientBackground";

export const Route = createFileRoute("/admin")({
  component: AdminRoot,
});

function AdminRoot() {
  const check = useServerFn(checkAdminRole);
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    check()
      .then(({ isAdmin }) => {
        if (isAdmin) setStatus("ok");
        else { setStatus("denied"); navigate({ to: "/home" as never }); }
      })
      .catch(() => { setStatus("denied"); navigate({ to: "/home" as never }); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "checking") {
    return (
      <main className="relative flex min-h-screen items-center justify-center">
        <AmbientBackground theme="safe" />
        <div className="size-12 animate-breathing rounded-full bg-primary/60" />
      </main>
    );
  }

  if (status !== "ok") return null;
  return <Outlet />;
}
