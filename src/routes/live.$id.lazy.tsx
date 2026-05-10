import { createLazyFileRoute } from "@tanstack/react-router";
import LiveDetailPage from "@/pages/LiveDetailPage";

export const Route = createLazyFileRoute("/live/$id")({
  component: LiveDetailPage,
});
