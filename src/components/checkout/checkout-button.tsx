import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrder, verifyCheckout } from "@/lib/license";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { cn } from "@/lib/utils";

interface CheckoutButtonProps {
  onSuccess: (licenseKey: string) => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  children?: React.ReactNode;
}

export function CheckoutButton({ onSuccess, className, variant = "primary", children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const [order] = await Promise.all([createOrder(), loadRazorpayScript()]);

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "EnvDiff",
        description: "One-time license",
        theme: { color: "#121314" },
        handler: async (response) => {
          try {
            const licenseKey = await verifyCheckout(response);
            onSuccess(licenseKey);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        onClick={startCheckout}
        disabled={loading}
        className={cn("w-full", className)}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children ?? "Get EnvDiff"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
