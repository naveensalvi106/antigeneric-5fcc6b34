import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Wand2, LayoutGrid, UserCheck, ArrowUpCircle, Sparkles,
  Clock, CheckCircle2, Circle, Image, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionDetails {
  title: string;
  description?: string;
  hasReferenceImage?: boolean;
  hasFaceImage?: boolean;
}

interface GeneratingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  submissionDetails?: SubmissionDetails;
}

const STEPS = [
  {
    icon: Search,
    title: "AI Research",
    description: "Scanning top thumbnails in your niche for winning patterns...",
    completedText: "Analyzed 240+ top-performing thumbnails in your niche",
  },
  {
    icon: Wand2,
    title: "Generate Scenes",
    description: "Creating custom scenes, backgrounds, and elements with AI...",
    completedText: "Generated 12 unique scene compositions",
  },
  {
    icon: LayoutGrid,
    title: "Smart Composition",
    description: "Placing elements for maximum visual impact and CTR...",
    completedText: "Optimized layout for 94% attention score",
  },
  {
    icon: UserCheck,
    title: "Face Retouching",
    description: "Enhancing faces to look sharp and attention-grabbing...",
    completedText: "Face enhanced with pro-grade retouching",
  },
  {
    icon: ArrowUpCircle,
    title: "4K Upscale",
    description: "Upscaling to crystal-clear 4K resolution...",
    completedText: "Upscaled to 3840×2160 ultra-HD",
  },
  {
    icon: Sparkles,
    title: "Final Polish",
    description: "Perfecting every detail before delivery...",
    completedText: "Pixel-perfect quality assured",
  },
];

const TOTAL_DURATION = 10 * 60; // 10 minutes in seconds

// Step completion times in seconds (spread across 10 minutes)
const STEP_TIMES = [90, 180, 300, 420, 510, 580]; // ~1.5, 3, 5, 7, 8.5, ~9.7 min

const GeneratingOverlay = ({ isVisible, onComplete, submissionDetails }: GeneratingOverlayProps) => {
  const navigate = useNavigate();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setElapsedSeconds(0);
      setCompletedSteps([]);
      setActiveStep(0);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_DURATION) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isVisible]);

  // Update completed steps based on elapsed time
  useEffect(() => {
    const newCompleted: number[] = [];
    let newActive = 0;
    STEP_TIMES.forEach((time, i) => {
      if (elapsedSeconds >= time) {
        newCompleted.push(i);
        newActive = Math.min(i + 1, STEPS.length - 1);
      }
    });
    setCompletedSteps(newCompleted);
    if (newCompleted.length < STEPS.length) {
      setActiveStep(newActive);
    }
  }, [elapsedSeconds]);

  if (!isVisible) return null;

  const progress = Math.min((elapsedSeconds / TOTAL_DURATION) * 100, 100);
  const remainingSeconds = Math.max(TOTAL_DURATION - elapsedSeconds, 0);
  const remainingMin = Math.floor(remainingSeconds / 60);
  const remainingSec = remainingSeconds % 60;

  // SVG circle params
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const allDone = completedSteps.length === STEPS.length;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
        <motion.div
          className="p-6 sm:p-8 rounded-3xl card-nuclear border border-primary/20 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          {/* Submission Details */}
          {submissionDetails && (
            <motion.div
              className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium mb-1">Your Request</p>
                  <p className="font-display font-bold text-foreground text-sm sm:text-base truncate">{submissionDetails.title}</p>
                  {submissionDetails.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{submissionDetails.description}</p>
                  )}
                  <div className="flex gap-3 mt-2">
                    {submissionDetails.hasReferenceImage && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                        <Image className="w-3 h-3" /> Reference attached
                      </span>
                    )}
                    {submissionDetails.hasFaceImage && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                        <UserCheck className="w-3 h-3" /> Face uploaded
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Circular Progress + Countdown */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-44 h-44 mb-4">
              {/* Background glow */}
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl" />
              
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Track */}
                <circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.1)"
                  strokeWidth="6"
                />
                {/* Progress */}
                <circle
                  cx="80" cy="80" r={radius}
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {!allDone ? (
                  <>
                    <span className="font-display font-extrabold text-3xl gradient-text">
                      {Math.round(progress)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-1">
                      Generating
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-400 mb-1" />
                    <span className="text-xs text-green-400 font-semibold">Complete</span>
                  </>
                )}
              </div>
            </div>

            {/* Countdown */}
            {!allDone && (
              <motion.div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Clock size={14} className="text-primary/60" />
                <span>
                  Estimated: <span className="font-mono font-semibold text-foreground">{remainingMin}:{remainingSec.toString().padStart(2, "0")}</span> remaining
                </span>
              </motion.div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(i);
              const isActive = !isCompleted && activeStep === i;
              const isPending = !isCompleted && !isActive;
              const Icon = step.icon;

              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : isCompleted
                      ? "bg-green-500/5 border border-green-500/10"
                      : "bg-transparent border border-transparent"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.4 }}
                >
                  {/* Status icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-500 ${
                    isCompleted
                      ? "bg-green-500/10"
                      : isActive
                      ? "bg-primary/15"
                      : "bg-muted/30"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : isActive ? (
                      <Icon className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold transition-colors duration-500 ${
                      isCompleted ? "text-green-400/90" : isActive ? "text-foreground" : "text-muted-foreground/40"
                    }`}>
                      {step.title}
                    </p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={isCompleted ? "done" : isActive ? "active" : "pending"}
                        className={`text-xs transition-colors duration-500 ${
                          isCompleted ? "text-green-400/50" : isActive ? "text-muted-foreground/70" : "text-muted-foreground/20"
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {isCompleted ? step.completedText : step.description}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Active spinner */}
                  {isActive && (
                    <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CTA section */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {allDone ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-center">
                  <PartyPopper className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">
                    Generation Complete!
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your thumbnail is ready. Refresh your dashboard or check your <span className="text-foreground font-medium">Gmail inbox</span> to see it.
                  </p>
                </div>
                <Button
                  variant="nuclear"
                  className="w-full"
                  onClick={() => {
                    onComplete();
                    navigate("/dashboard");
                  }}
                >
                  <RefreshCw size={16} className="mr-2" /> Refresh & Check Dashboard
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="nuclear"
                  className="w-full"
                  onClick={() => {
                    onComplete();
                    navigate("/dashboard");
                  }}
                >
                  Check Dashboard
                </Button>
                <p className="text-center text-[10px] text-muted-foreground/50 mt-2">
                  You can close this — we'll notify you when it's ready
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GeneratingOverlay;
