import { createLazyFileRoute } from "@tanstack/react-router";
import LandingPagesPage from "@/pages/LandingPagesPage";

export const Route = createLazyFileRoute("/landing-pages/")({
  component: LandingPagesPage,
});
