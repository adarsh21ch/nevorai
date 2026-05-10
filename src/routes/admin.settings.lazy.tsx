import { createLazyFileRoute } from "@tanstack/react-router";
import AdminSettingsPage from "@/pages/AdminSettingsPage";

export const Route = createLazyFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});
