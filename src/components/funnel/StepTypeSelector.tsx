// Stub — to be expanded with full step type metadata.
import { Play, ClipboardList, ExternalLink, CreditCard, UserCheck, Calendar } from "lucide-react";

export type StepTypeMeta = {
  type: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  description?: string;
};

const META: Record<string, StepTypeMeta> = {
  video: { type: "video", label: "Video", icon: Play, color: "text-blue-500", bg: "bg-blue-500/10" },
  lead_form: { type: "lead_form", label: "Lead Form", icon: ClipboardList, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  cta: { type: "cta", label: "CTA / Link", icon: ExternalLink, color: "text-purple-500", bg: "bg-purple-500/10" },
  payment: { type: "payment", label: "Payment", icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
  manual_approval: { type: "manual_approval", label: "Manual Approval", icon: UserCheck, color: "text-rose-500", bg: "bg-rose-500/10" },
  booking: { type: "booking", label: "Booking", icon: Calendar, color: "text-teal-500", bg: "bg-teal-500/10" },
};

export const getStepTypeMeta = (type: string): StepTypeMeta => META[type] || META.video;
export const STEP_TYPES = Object.values(META);

export const StepTypeSelector = ({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (type: string) => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading font-bold mb-4">Add Step</h3>
        <div className="grid grid-cols-2 gap-2">
          {STEP_TYPES.map((m) => (
            <button key={m.type} onClick={() => { onSelect(m.type); onClose(); }} className="p-4 rounded-xl border border-border hover:border-primary/50 text-left transition-colors">
              <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-2`}><m.icon size={16} className={m.color} /></div>
              <p className="text-sm font-medium">{m.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
