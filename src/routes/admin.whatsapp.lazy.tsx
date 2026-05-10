import { createLazyFileRoute } from "@tanstack/react-router";
import AdminWhatsAppPage from "@/pages/AdminWhatsAppPage";

export const Route = createLazyFileRoute("/admin/whatsapp")({
  component: AdminWhatsAppPage,
});
