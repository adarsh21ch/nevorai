import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Zap, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

interface TopUpConfig {
  plan_key: string;
  price_per_unit: number;
  unit_size: number;
  extra_views_purchased: number;
  extra_views_expires_at: string | null;
}

export function TopUpViewsCard({ onPurchased }: { onPurchased?: () => void }) {
  const { user, profile } = useAuth();
  const [config, setConfig] = useState<TopUpConfig | null>(null);
  const [units, setUnits] = useState(1);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.functions.invoke("razorpay-portal", {
      body: { action: "get_topup_config" },
    });
    if (data) setConfig(data as TopUpConfig);
  };

  useEffect(() => { if (user) refresh(); }, [user]);

  if (!config || config.price_per_unit <= 0 || config.unit_size <= 0) return null;

  const totalViews = units * config.unit_size;
  const totalPrice = units * config.price_per_unit;

  const handleBuy = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load payment gateway");

      const { data, error } = await supabase.functions.invoke("razorpay-portal", {
        body: { action: "create_topup_order", units },
      });
      if (error || !data?.order_id) throw new Error(error?.message || "Failed to create order");

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "nFlow",
        description: `${data.total_views} extra views`,
        order_id: data.order_id,
        handler: async (response: any) => {
          try {
            const { error: vErr } = await supabase.functions.invoke("razorpay-portal", {
              body: {
                action: "verify_topup_payment",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
            if (vErr) throw vErr;
            toast.success(`+${data.total_views} views added! Valid until end of month.`);
            await refresh();
            onPurchased?.();
          } catch {
            toast.error("Payment received but not yet activated. Contact support.");
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: user.email,
          contact: profile?.phone || "",
        },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setLoading(null as any) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Need more views this month?</h3>
          <p className="text-sm text-muted-foreground">
            Top up extra funnel views — valid until the end of the current month.
          </p>
          {config.extra_views_purchased > 0 && config.extra_views_expires_at && (
            <p className="text-xs text-emerald-500 mt-1">
              You have <strong>{config.extra_views_purchased.toLocaleString("en-IN")}</strong> extra views, valid until {format(new Date(config.extra_views_expires_at), "dd MMM yyyy")}.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Units</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setUnits(Math.max(1, units - 1))} disabled={loading || units <= 1}>
              <Minus size={14} />
            </Button>
            <div className="flex-1 text-center font-heading font-semibold text-lg">{units}</div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setUnits(Math.min(100, units + 1))} disabled={loading || units >= 100}>
              <Plus size={14} />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {config.unit_size.toLocaleString("en-IN")} views per unit
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">You'll get</p>
          <p className="font-heading text-xl font-bold">+{totalViews.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-muted-foreground">views added immediately</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Total</p>
          <p className="font-heading text-xl font-bold">₹{totalPrice.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-muted-foreground">one-time, no auto-renew</p>
        </div>
      </div>

      <Button onClick={handleBuy} disabled={loading} className="w-full md:w-auto gap-2">
        <Zap size={16} />
        {loading ? "Opening checkout…" : `Buy ${totalViews.toLocaleString("en-IN")} views for ₹${totalPrice.toLocaleString("en-IN")}`}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Extra views expire at the end of this month and don't roll over. Unused views are not refundable.
      </p>
    </div>
  );
}
