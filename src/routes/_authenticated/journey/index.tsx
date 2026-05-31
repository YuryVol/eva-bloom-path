import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/journey/")({
  component: () => <Navigate to="/journey/spheres" />,
});
