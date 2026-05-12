import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import HelpCenterPage from "@/pages/HelpCenterPage";

export const Route = createFileRoute("/help")({
  component: () => (
    <DashboardLayout>
      <HelpCenterPage />
    </DashboardLayout>
  ),
});
