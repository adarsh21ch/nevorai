import { createLazyFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createLazyFileRoute("/")({
  component: Index,
});
