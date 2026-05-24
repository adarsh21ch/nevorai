import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WhatsAppTestPage = () => {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("Hello from Nevorai");
  const [sending, setSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = to.replace(/\D/g, "");
    if (cleaned.length < 8) {
      toast.error("Enter a valid phone number with country code");
      return;
    }
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setSending(true);
    setLastResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-send-text", {
        body: { to: cleaned, message: message.trim() },
      });

      if (error) {
        setLastResponse(`Error: ${error.message}\n\n${JSON.stringify(data, null, 2)}`);
        toast.error(error.message || "Failed to send");
      } else {
        setLastResponse(JSON.stringify(data, null, 2));
        toast.success("Message sent");
      }
    } catch (err) {
      const msg = (err as Error).message;
      setLastResponse(`Network error: ${msg}`);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <MessageCircle className="text-emerald-500" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Send WhatsApp Message</h1>
            <p className="text-sm text-muted-foreground">
              Sends a free-form text message via the Supabase WhatsApp backend.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose</CardTitle>
            <CardDescription>
              Uses the <code className="text-xs">whatsapp-send-text</code> edge function. Make sure WhatsApp is configured in <code className="text-xs">/admin/whatsapp</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label htmlFor="to">Recipient (with country code)</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="919xxxxxxxxx"
                  inputMode="numeric"
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </form>

            {lastResponse && (
              <pre className="mt-4 text-xs bg-muted p-3 rounded-md overflow-auto whitespace-pre-wrap break-all max-h-60">
                {lastResponse}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppTestPage;
