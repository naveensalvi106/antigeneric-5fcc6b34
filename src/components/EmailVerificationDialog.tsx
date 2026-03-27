import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationDialog = ({ isOpen, onClose, email }: EmailVerificationDialogProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md p-8 rounded-2xl card-nuclear border border-primary/20 text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-3">
          Check Your Email
        </h2>

        <p className="text-muted-foreground text-base mb-2 leading-relaxed">
          We've sent a verification link to
        </p>
        <p className="text-primary font-semibold text-lg mb-5">{email}</p>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Check your <span className="text-foreground font-medium">spam/junk folder</span> if you don't see it
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              After verifying, come back and <span className="text-foreground font-medium">sign in</span>
            </p>
          </div>
        </div>

        <Button variant="nuclear" size="xl" className="w-full" onClick={onClose}>
          Got it!
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default EmailVerificationDialog;
