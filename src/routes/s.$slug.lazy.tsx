import { createLazyFileRoute } from "@tanstack/react-router";
import PublicLivePage from "@/pages/PublicLivePage";

export const Route = createLazyFileRoute("/s/$slug")({
  component: PublicLivePage,
});
