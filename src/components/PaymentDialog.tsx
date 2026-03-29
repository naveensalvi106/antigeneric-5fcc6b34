import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle, Copy, Upload, X, QrCode, CreditCard, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import upiQrCode from "@/assets/upi-qr-code.png";

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

const UPI_ID = "9358935758@ibl";

const PAYPAL_HOSTED_BUTTON_IDS: Record<string, string> = {
  Pro: "MQ9GDB6QXPLAN",
};

type PaymentStep = "choose" | "paypal" | "upi" | "upload";

const PaymentDialog = ({ open, onOpenChange, planName, price, paypalLink }: PaymentDialogProps) => {
  const upiAmount = UPI_AMOUNTS[planName] || "0";
  const [step, setStep] = useState<PaymentStep>("choose");
  const [confirming, setConfirming] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaypal = () => {
    window.open(paypalLink, "_blank");
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      toast.success("UPI ID copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Max 5MB.");
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmPayment = async () => {
    if (!screenshot) {
      toast.error("Please upload your payment screenshot first.");
      return;
    }

    setConfirming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || "Unknown";

      // Upload screenshot to storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `payment-proofs/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('thumbnail-uploads')
        .upload(fileName, screenshot, { contentType: screenshot.type });

      let screenshotUrl = "";
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('thumbnail-uploads').getPublicUrl(uploadData.path);
        screenshotUrl = urlData.publicUrl;
      }

      await supabase.functions.invoke("notify-submission", {
        body: {
          title: `💰 Payment Confirmation — ${planName} Plan`,
          description: `User claims payment of ${price} / ₹${upiAmount} for the ${planName} plan via UPI. Please verify and add credits.`,
          userEmail,
          submissionId: `payment-${Date.now()}`,
          thumbnailImageUrl: screenshotUrl,
        },
      });

      toast.success("Payment proof submitted! Credits will be added after verification.");
      resetAndClose();
    } catch (err) {
      toast.error("Failed to send confirmation. Please contact support.");
    } finally {
      setConfirming(false);
    }
  };

  const resetAndClose = () => {
    setStep("choose");
    setScreenshot(null);
    setScreenshotPreview(null);
    setConfirming(false);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetAndClose();
    else onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border overflow-hidden p-0">
        {/* Gradient header bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
              {step !== "choose" && (
                <button
                  onClick={() => setStep(step === "upload" ? "upi" : "choose")}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              {step === "choose" && `Pay for ${planName} Plan`}
              {step === "upi" && "Scan & Pay via UPI"}
              {step === "upload" && "Upload Payment Proof"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {step === "choose" && `Choose your preferred payment method — ${price} / ₹${upiAmount}`}
              {step === "upi" && `Scan the QR code or copy UPI ID to pay ₹${upiAmount}`}
              {step === "upload" && "Upload a screenshot of your successful payment"}
            </DialogDescription>
          </DialogHeader>

          {/* Step: Choose method */}
          {step === "choose" && (
            <div className="flex flex-col gap-3 mt-4">
              {/* Amount badge */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30">
                  <span className="font-display font-extrabold text-2xl gradient-text">₹{upiAmount}</span>
                  <span className="font-display font-extrabold text-2xl gradient-text">/ {price}</span>
                </div>
              </div>

              <Button
                variant="nuclear"
                size="lg"
                className="w-full justify-center gap-3 mt-2"
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
                onClick={() => setStep("upi")}
              >
                <QrCode size={20} />
                Pay with UPI (QR Code)
              </Button>

              <p className="text-[11px] text-muted-foreground text-center mt-1">
                UPI works with PhonePe, GPay, Paytm & all UPI apps
              </p>
            </div>
          )}

          {/* Step: UPI QR + copy */}
          {step === "upi" && (
            <div className="flex flex-col items-center gap-4 mt-4">
              {/* QR Code with premium frame */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 via-accent/20 to-primary/40 blur-sm" />
                <div className="relative bg-white rounded-xl p-3 shadow-[0_0_40px_-10px_hsl(217_91%_60%/0.3)]">
                  <img
                    src={upiQrCode}
                    alt="UPI QR Code"
                    className="w-52 h-52 object-contain"
                  />
                </div>
              </div>

              {/* Amount badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/20">
                <span className="text-sm font-medium text-muted-foreground">Amount:</span>
                <span className="font-display font-bold text-lg text-foreground">₹{upiAmount}</span>
              </div>

              {/* UPI ID copy */}
              <div className="w-full">
                <p className="text-xs text-muted-foreground text-center mb-2">Or copy UPI ID manually</p>
                <button
                  onClick={copyUpiId}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/8 transition-all group"
                >
                  <code className="text-sm font-mono text-foreground tracking-wide">{UPI_ID}</code>
                  <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                    <Copy size={14} />
                    Copy
                  </div>
                </button>
              </div>

              <Button
                variant="nuclear"
                size="lg"
                className="w-full justify-center gap-3 mt-1"
                onClick={() => setStep("upload")}
              >
                <CheckCircle size={18} />
                I've Paid — Upload Proof
              </Button>
            </div>
          )}

          {/* Step: Upload screenshot */}
          {step === "upload" && (
            <div className="flex flex-col gap-4 mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!screenshotPreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-full aspect-[4/3] rounded-xl border-2 border-dashed border-white/15 hover:border-primary/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Upload Payment Screenshot</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot"
                    className="w-full max-h-64 object-contain bg-black/20"
                  />
                  <button
                    onClick={removeScreenshot}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-xs text-white/80 font-medium">Screenshot attached ✓</p>
                  </div>
                </div>
              )}

              <Button
                variant="nuclear"
                size="lg"
                className="w-full justify-center gap-3"
                onClick={handleConfirmPayment}
                disabled={confirming || !screenshot}
              >
                <CheckCircle size={18} />
                {confirming ? "Submitting..." : "Submit Payment Proof"}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                Credits will be added within 10 minutes after verification
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
