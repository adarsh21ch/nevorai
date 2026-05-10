import { createLazyFileRoute } from "@tanstack/react-router";
import AuthPage from "@/components/auth/AuthPage";

export const Route = createLazyFileRoute("/auth")({
  component: AuthPage,
});
