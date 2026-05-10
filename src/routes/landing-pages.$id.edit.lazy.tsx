import { createLazyFileRoute } from "@tanstack/react-router";
import LandingPageEditor from "@/pages/LandingPageEditor";

export const Route = createLazyFileRoute("/landing-pages/$id/edit")({
  component: LandingPageEditor,
});
