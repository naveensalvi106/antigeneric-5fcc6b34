import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Clock, Mail, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface GeneratingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const STEPS = [
  "Analyzing your request...",
  "Researching top-performing thumbnails...",
  "Generating scene elements...",
  "Composing smart layout...",
  "Enhancing face & elements...",
  "Upscaling to 4K resolution...",
  "Final polish & retouching...",
];

const GeneratingOverlay = ({ isVisible, onComplete }: GeneratingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [estimatedTime] = useState(() => Math.floor(Math.random() * 6) + 5); // 5-10 minutes
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      setShowNotification(false);
      return;
    }

    // Simulate progress over ~8 seconds
    const totalDuration = 8000;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const pct = Math.min((elapsed / totalDuration) * 100, 95);
      setProgress(pct);
      setCurrentStep(Math.min(Math.floor((pct / 100) * STEPS.length), STEPS.length - 1));

      if (pct >= 95) {
        clearInterval(timer);
        setShowNotification(true);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg mx-4 p-8 rounded-2xl card-nuclear border border-primary/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {!showNotification ? (
          <>
            {/* Generating animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-6 h-6 text-primary animate-spin" />
              </div>
            </div>

            <h2 className="font-display text-xl font-bold text-foreground text-center mb-2">
              Generating Your Thumbnail
            </h2>

            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
              <Clock size={14} />
              <span>Estimated time: <span className="text-primary font-semibold">{estimatedTime} minutes</span></span>
            </div>

            <Progress value={progress} className="mb-4 h-2" />

            <motion.p
              key={currentStep}
              className="text-sm text-center text-muted-foreground"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {STEPS[currentStep]}
            </motion.p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="font-display text-xl font-bold text-foreground mb-3">
              Your Thumbnail is Being Crafted!
            </h2>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Our AI is working on your thumbnail. This usually takes <span className="text-primary font-semibold">{estimatedTime} minutes</span>. We'll notify you when it's ready!
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Mail size={18} className="text-primary shrink-0" />
                <p className="text-xs text-muted-foreground text-left">
                  You'll receive an <span className="text-foreground font-medium">email notification</span> when your thumbnail is ready
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Bell size={18} className="text-primary shrink-0" />
                <p className="text-xs text-muted-foreground text-left">
                  Check your <span className="text-foreground font-medium">AntiGeneric dashboard</span> to download once complete
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GeneratingOverlay;
