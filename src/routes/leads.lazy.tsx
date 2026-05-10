import { createLazyFileRoute } from "@tanstack/react-router";
import LeadsPage from "@/pages/LeadsPage";

export const Route = createLazyFileRoute("/leads")({
  component: LeadsPage,
});
