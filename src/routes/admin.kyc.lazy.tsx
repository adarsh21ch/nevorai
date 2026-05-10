import { createLazyFileRoute } from "@tanstack/react-router";
import AdminKYCPage from "@/pages/AdminKYCPage";

export const Route = createLazyFileRoute("/admin/kyc")({
  component: AdminKYCPage,
});
