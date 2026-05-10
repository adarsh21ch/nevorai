import { createLazyFileRoute } from "@tanstack/react-router";
import PublicLandingPage from "@/pages/PublicLandingPage";

export const Route = createLazyFileRoute("/l/$slug")({
  component: PublicLandingPage,
});
