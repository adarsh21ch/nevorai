// TODO: Full SpeakerPhotoUpload — using simplified version for now.
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

interface SpeakerPhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export const SpeakerPhotoUpload = ({ value, onChange }: SpeakerPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2MB"); return; }
    setUploading(true);
    try {
      const fileName = `speakers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("landing-page-assets").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("landing-page-assets").getPublicUrl(fileName);
      onChange(publicUrl);
      toast.success("Photo uploaded!");
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Speaker Photo</Label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {value ? (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
            <img src={value} alt="Speaker" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <Upload size={13} className="mr-1.5" />} Change Photo
            </Button>
            <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onChange("")}>
              <X size={13} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 hover:bg-muted transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
          {uploading ? <Loader2 size={24} className="animate-spin text-muted-foreground" /> : <Camera size={24} className="text-muted-foreground" />}
          <span className="text-xs text-muted-foreground font-medium">Upload Photo</span>
          <span className="text-[10px] text-muted-foreground/70">JPG, PNG, WebP · Max 2MB</span>
        </button>
      )}
    </div>
  );
};
