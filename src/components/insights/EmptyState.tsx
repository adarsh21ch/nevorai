import { LucideIcon } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

export function InsightsEmptyState({
  icon: Icon,
  title,
  hint,
  ctaLabel,
  ctaTo,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  ctaLabel?: string;
  ctaTo?: string;
}) {
  return (
    <div className="premium-card p-10 text-center flex flex-col items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-primary/10 grid place-items-center">
        <Icon size={24} className="text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-heading font-semibold">{title}</h3>
        {hint ? <p className="text-xs text-muted-foreground mt-1 max-w-xs">{hint}</p> : null}
      </div>
      {ctaLabel && ctaTo ? (
        <Link to={ctaTo}>
          <Button size="sm">{ctaLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
