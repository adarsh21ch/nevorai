import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import AuthPage from "@/components/auth/AuthPage";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ email: z.string().optional() }),
  component: AuthPage,
});
