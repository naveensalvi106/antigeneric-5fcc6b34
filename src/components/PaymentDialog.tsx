import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  price: string;
  paypalLink: string;
}

const UPI_AMOUNTS: Record<string, string> = {
  Pro: "400",
  Agency: "900",
};

const PaymentDialog = ({ open, onOpenChange, planName, price, paypalLink }: PaymentDialogProps) => {
  const upiAmount = UPI_AMOUNTS[planName] || "0";
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handlePaypal = () => {
    window.open(paypalLink, "_blank");
    setPaymentStarted(true);
  };

  const handleUPI = () => {
    const upiLink = `upi://pay?pa=9358935758@ibl&am=${upiAmount}&cu=INR&tn=${planName}%20Plan%20Purchase`;
    window.location.href = upiLink;
    setPaymentStarted(true);
  };

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || "Unknown";

      await supabase.functions.invoke("notify-submission", {
        body: {
          title: `💰 Payment Confirmation — ${planName} Plan`,
          description: `User claims payment of ${price} / ₹${upiAmount} for the ${planName} plan. Please verify and add credits.`,
          userEmail,
          submissionId: `payment-${Date.now()}`,
        },
      });

      toast.success("Payment confirmation sent! Credits will be added after verification.");
      setPaymentStarted(false);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to send confirmation. Please contact support.");
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setPaymentStarted(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Pay for {planName} Plan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose your preferred payment method — {price} / ₹{upiAmount}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="nuclear"
            size="lg"
            className="w-full justify-center gap-3"
            onClick={handlePaypal}
          >
            <img
              src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
              alt="PayPal"
              className="w-6 h-6 rounded"
            />
            Pay with PayPal
          </Button>

          <Button
            variant="nuclear"
            size="lg"
            className="w-full justify-center gap-3"
            onClick={handleUPI}
          >
            <Smartphone size={20} />
            Pay with UPI
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-1">
            UPI works with PhonePe, GPay, Paytm & all UPI apps
          </p>

          {paymentStarted && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-3">
                Completed your payment? Tap below to notify us.
              </p>
              <Button
                variant="nuclear"
                size="lg"
                className="w-full justify-center gap-3"
                onClick={handleConfirmPayment}
                disabled={confirming}
              >
                <CheckCircle size={20} />
                {confirming ? "Sending..." : "I've Paid — Confirm"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Credits will be added after we verify your payment
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
