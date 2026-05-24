import { createLazyFileRoute } from "@tanstack/react-router";
import WhatsAppTestPage from "@/pages/WhatsAppTestPage";

export const Route = createLazyFileRoute("/whatsapp-test")({
  component: WhatsAppTestPage,
});
