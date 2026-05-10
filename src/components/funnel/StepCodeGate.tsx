// Stub — to be expanded in next pass.
import { Lock } from "lucide-react";
export const StepCodeGate = ({ onSuccess }: { stepId: string; sessionId: string; message?: string; onSuccess: () => void; onCancel?: () => void }) => {
  return (
    <div className="p-8 text-center">
      <Lock size={32} className="mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mb-4">This step requires an access code (coming in next port pass).</p>
      <button className="text-xs underline" onClick={onSuccess}>Skip for now</button>
    </div>
  );
};
