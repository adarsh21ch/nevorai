import { createLazyFileRoute } from "@tanstack/react-router";
import AdminUsersPage from "@/pages/AdminUsersPage";

export const Route = createLazyFileRoute("/admin/users")({
  component: AdminUsersPage,
});
