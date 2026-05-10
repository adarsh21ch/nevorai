import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/landing/Logo";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 gradient-bg-subtle">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Logo size="default" showByline />
          <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>Sign out</Button>
        </div>
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-2">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</h1>
          <p className="text-muted-foreground">Auth is working. The full dashboard and other pages will be ported next.</p>
          <pre className="mt-6 text-xs bg-muted p-4 rounded-lg overflow-auto">{JSON.stringify({ id: user.id, email: user.email }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
