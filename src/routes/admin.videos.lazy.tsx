import { createLazyFileRoute } from "@tanstack/react-router";
import AdminVideosPage from "@/pages/AdminVideosPage";

export const Route = createLazyFileRoute("/admin/videos")({
  component: AdminVideosPage,
});
