import { createLazyFileRoute } from "@tanstack/react-router";
import LivePage from "@/pages/LivePage";

export const Route = createLazyFileRoute("/live")({
  component: LivePage,
});
