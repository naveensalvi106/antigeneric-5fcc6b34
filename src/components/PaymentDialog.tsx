import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  price: string;
  paypalLink: string;
}

const UPI_AMOUNTS: Record<string, string> = {
  Pro: "400",
  Agency: "999",
};

const PaymentDialog = ({ open, onOpenChange, planName, price, paypalLink }: PaymentDialogProps) => {
  const upiAmount = UPI_AMOUNTS[planName] || "0";

  const handlePaypal = () => {
    window.open(paypalLink, "_blank");
    onOpenChange(false);
  };

  const handleUPI = () => {
    const upiLink = `upi://pay?pa=9358935758@axl&pn=AntiGeneric&am=${upiAmount}&cu=INR&tn=${planName}%20Plan%20Purchase`;
    window.location.href = upiLink;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            variant="nuclear-outline"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
