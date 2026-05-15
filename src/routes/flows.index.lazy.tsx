import { createLazyFileRoute } from "@tanstack/react-router";
import FunnelsPage from "@/pages/FunnelsPage";

export const Route = createLazyFileRoute("/flows/")({
  component: FunnelsPage,
});
