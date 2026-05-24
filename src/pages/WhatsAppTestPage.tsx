import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_ENDPOINT =
  (typeof window !== "undefined" && localStorage.getItem("wa_backend_url")) ||
  "http://localhost:3000/send-message";

const WhatsAppTestPage = () => {
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
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
    if (!endpoint.trim()) {
      toast.error("Backend URL is required");
      return;
    }

    localStorage.setItem("wa_backend_url", endpoint);
    setSending(true);
    setLastResponse("");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: cleaned, message: message.trim() }),
      });
      const text = await res.text();
      setLastResponse(`${res.status} ${res.statusText}\n\n${text}`);
      if (res.ok) {
        toast.success("Message sent");
      } else {
        toast.error(`Failed: ${res.status}`);
      }
    } catch (err) {
      const msg = (err as Error).message;
      setLastResponse(`Network error: ${msg}`);
      toast.error(
        msg.includes("Failed to fetch")
          ? "Cannot reach backend. localhost only works when this app runs on the same machine."
          : msg,
      );
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
              Test your Node.js + Meta WhatsApp backend.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose</CardTitle>
            <CardDescription>
              POST to your backend with <code className="text-xs">{`{ to, message }`}</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label htmlFor="endpoint">Backend URL</Label>
                <Input
                  id="endpoint"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="http://localhost:3000/send-message"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use ngrok or a deployed URL when testing from a hosted site.
                </p>
              </div>

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
