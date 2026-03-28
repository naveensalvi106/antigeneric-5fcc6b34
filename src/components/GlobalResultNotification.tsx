import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X, ExternalLink, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type NotificationType = "completed" | "rejected";

const GlobalResultNotification = () => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [type, setType] = useState<NotificationType>("completed");
  const navigate = useNavigate();

  useEffect(() => {
    let userEmail: string | null = null;
    // Track pending submission IDs so we can detect deletions
    let pendingIds: Set<string> = new Set();
    let pendingTitles: Map<string, string> = new Map();

    const setupListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;
      userEmail = session.user.email;

      // Load current pending submissions for this user
      const { data: pendingSubs } = await supabase
        .from("thumbnail_submissions")
        .select("id, title")
        .eq("user_email", userEmail)
        .eq("status", "pending");

      if (pendingSubs) {
        pendingSubs.forEach((s) => {
          pendingIds.add(s.id);
          pendingTitles.set(s.id, s.title);
        });
      }

      const channel = supabase
        .channel("global-result-notify")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "thumbnail_submissions",
          },
          (payload: any) => {
            const updated = payload.new;
            if (
              updated.status === "completed" &&
              updated.result_image_url &&
              updated.user_email === userEmail
            ) {
              pendingIds.delete(updated.id);
              pendingTitles.delete(updated.id);
              setType("completed");
              setTitle(updated.title);
              setResultUrl(updated.result_image_url);
              setShow(true);
              setTimeout(() => setShow(false), 15000);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "thumbnail_submissions",
          },
          (payload: any) => {
            const deletedId = payload.old?.id;
            if (deletedId && pendingIds.has(deletedId)) {
              const deletedTitle = pendingTitles.get(deletedId) || "";
              pendingIds.delete(deletedId);
              pendingTitles.delete(deletedId);
              setType("rejected");
              setTitle(deletedTitle);
              setResultUrl("");
              setShow(true);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupListener();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, []);

  if (!show) return null;

  // Rejected = big fullscreen overlay
  if (type === "rejected") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-lg rounded-2xl border border-destructive/30 bg-card shadow-[0_0_80px_-10px_hsl(0_60%_50%/0.3)] p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
              <AlertTriangle className="text-destructive" size={32} />
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-3">
              Unable to Generate Thumbnail
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed mb-2">
              Due to high traffic, we were unable to generate your thumbnail
              {title ? ` for "${title}"` : ""} at this time.
            </p>

            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              <span className="text-primary font-semibold">Your credit has been refunded.</span>
              {" "}Please try again later.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="nuclear"
                onClick={() => {
                  setShow(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setShow(false)}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Completed = top notification
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -80, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-md"
      >
        <div className="relative rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_0_60px_-10px_hsl(217_91%_60%/0.4)] p-5">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="text-primary" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-foreground text-base">
                Your Thumbnail is Ready! 🎉
              </h3>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {title ? `"${title}"` : "Your thumbnail"} has been completed.
              </p>
              <button
                onClick={() => {
                  setShow(false);
                  navigate("/dashboard");
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink size={14} />
                View in Dashboard
              </button>
            </div>
          </div>

          {resultUrl && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img
                src={resultUrl}
                alt="Your thumbnail"
                className="w-full h-32 object-cover"
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalResultNotification;
