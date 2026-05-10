// Stub for FlowStep type + config panel — full version in next port pass.
export type FlowStep = {
  id?: string;
  step_order: number;
  title: string;
  description: string;
  step_type: string;
  video_asset_id: string | null;
  is_active: boolean;
  unlock_rule_type: string;
  unlock_rule_value: string;
  cta_text: string;
  cta_url: string;
  booking_url: string;
  unlock_condition?: string;
  unlock_percentage?: number;
  time_delay_enabled?: boolean;
  time_delay_minutes?: number;
  speaker_mode_step?: string;
  speaker_name_custom?: string;
  speaker_title?: string;
  speaker_bio?: string;
  speaker_photo_url_custom?: string;
  video_topics_step_enabled?: boolean;
  video_topics_step?: string[];
  timer_cta_enabled?: boolean;
  timer_cta_text?: string;
  timer_cta_url?: string;
  timer_cta_style?: string;
  access_code_enabled?: boolean;
  access_code_plain?: string;
  access_code_hash?: string | null;
  access_code_message?: string;
};

export const StepConfigPanel = ({ step, onChange, onClose }: { step: FlowStep; onChange: (s: FlowStep) => void; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-heading font-bold mb-4">Configure Step</h3>
        <p className="text-sm text-muted-foreground mb-4">Full step config UI coming in next port pass.</p>
        <input
          className="w-full p-2 rounded border border-border bg-muted mb-3"
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="Step title"
        />
        <button className="w-full py-2 rounded bg-primary text-primary-foreground" onClick={onClose}>Done</button>
      </div>
    </div>
  );
};
