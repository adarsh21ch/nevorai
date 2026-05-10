import { createLazyFileRoute } from "@tanstack/react-router";
import AdminSubscriptionsPage from "@/pages/AdminSubscriptionsPage";

export const Route = createLazyFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});
