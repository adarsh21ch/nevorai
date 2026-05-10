import { createLazyFileRoute } from "@tanstack/react-router";
import AdminSupportPage from "@/pages/AdminSupportPage";

export const Route = createLazyFileRoute("/admin/support")({
  component: AdminSupportPage,
});
