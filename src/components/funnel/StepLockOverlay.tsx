// Stub — to be expanded.
import { Lock } from "lucide-react";
export const StepLockOverlay = ({ children, locked, message }: { children: React.ReactNode; locked: boolean; message?: string }) => {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
        <div className="text-center p-4">
          <Lock size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{message || "Locked"}</p>
        </div>
      </div>
    </div>
  );
};
