// PrivacySettings — visibility + access code only.
// Lead-capture fields live in the Lead Capture step (single source of truth).
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Globe, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";

interface PrivacySettingsProps {
  visibility: string;
  accessCode: string;
  // Kept for backward compatibility with callers, but no longer rendered.
  requiredFields?: { email: boolean; city: boolean; state: boolean; whatsapp: boolean };
  onVisibilityChange: (v: string) => void;
  onAccessCodeChange: (code: string) => void;
  onRequiredFieldsChange?: (fields: { email: boolean; city: boolean; state: boolean; whatsapp: boolean }) => void;
}

export const PrivacySettings = ({
  visibility,
  accessCode,
  onVisibilityChange,
  onAccessCodeChange,
}: PrivacySettingsProps) => {
  const [showCode, setShowCode] = useState(false);
  const isPrivate = visibility === "private";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-heading font-semibold text-foreground">Privacy Settings</h2>
      <p className="text-sm text-muted-foreground">Control who can access this funnel.</p>

      <div className="p-4 bg-muted/40 rounded-xl border border-border">
        <Label className="font-semibold mb-3 block text-foreground">Funnel Visibility</Label>
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => onVisibilityChange("public")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
              !isPrivate ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe size={14} /> Public
          </button>
          <button
            type="button"
            onClick={() => onVisibilityChange("private")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all ${
              isPrivate ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Lock size={14} /> Private
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className={`w-2 h-2 rounded-full ${isPrivate ? "bg-primary" : "bg-emerald-500"}`} />
          <p className="text-xs text-muted-foreground">
            {isPrivate
              ? "Viewers must enter an access code to unlock this funnel"
              : "Anyone with the link can view this funnel"}
          </p>
        </div>
      </div>

      {isPrivate && (
        <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-3 animate-in slide-in-from-top-2 duration-300">
          <Label className="font-semibold flex items-center gap-2 text-foreground">
            <KeyRound size={14} className="text-primary" /> Access Code
          </Label>
          <p className="text-xs text-muted-foreground">
            Share this code with people you want to give access to. Saved codes appear here so you can copy or change them.
          </p>
          <div className="relative">
            <Input
              type={showCode ? "text" : "password"}
              value={accessCode}
              onChange={(e) => onAccessCodeChange(e.target.value.toUpperCase().slice(0, 32))}
              placeholder="e.g. VIP1500, TEAM2024"
              className="bg-background border-border pr-10 uppercase tracking-wider font-mono text-foreground"
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showCode ? "Hide code" : "Show code"}
            >
              {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground italic">
            What you collect from viewers (name, phone, email, city, state, WhatsApp…) is configured in the Lead Capture step.
          </p>
        </div>
      )}
    </div>
  );
};
