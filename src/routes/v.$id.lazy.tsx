import { createLazyFileRoute } from "@tanstack/react-router";
import PublicVideoPage from "@/pages/PublicVideoPage";

export const Route = createLazyFileRoute("/v/$id")({
  component: PublicVideoPage,
});
