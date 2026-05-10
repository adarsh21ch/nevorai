import { createLazyFileRoute } from "@tanstack/react-router";
import VideosPage from "@/pages/VideosPage";

export const Route = createLazyFileRoute("/videos")({
  component: VideosPage,
});
