import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X, ExternalLink, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type NotificationType = "completed" | "rejected";

interface NotificationState {
  type: NotificationType;
  title: string;
  resultUrl: string;
}

const GlobalResultNotification = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const applySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserEmail(session?.user?.email ?? null);
    };

    applySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const pendingIds = new Set<string>();
    const pendingTitles = new Map<string, string>();

    const loadPending = async () => {
      const { data } = await supabase
        .from("thumbnail_submissions")
        .select("id, title")
        .eq("user_email", userEmail)
        .eq("status", "pending");

      data?.forEach((row) => {
        pendingIds.add(row.id);
        pendingTitles.set(row.id, row.title);
      });
    };

    const showCompleted = (title: string, resultUrl: string) => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      setNotification({ type: "completed", title, resultUrl });
      hideTimerRef.current = window.setTimeout(() => setNotification(null), 15000);
    };

    const showRejected = (title: string) => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      setNotification({ type: "rejected", title, resultUrl: "" });
    };

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = async () => {
      await loadPending();

      channel = supabase
        .channel(`global-result-notify-${userEmail}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "thumbnail_submissions" },
          (payload: any) => {
            const inserted = payload.new;
            if (inserted?.user_email !== userEmail) return;
            if (inserted.status === "pending") {
              pendingIds.add(inserted.id);
              pendingTitles.set(inserted.id, inserted.title || "");
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "thumbnail_submissions" },
          (payload: any) => {
            const updated = payload.new;
            if (updated?.user_email !== userEmail) return;

            if (updated.status === "pending") {
              pendingIds.add(updated.id);
              pendingTitles.set(updated.id, updated.title || "");
              return;
            }

            pendingIds.delete(updated.id);
            pendingTitles.delete(updated.id);

            if (updated.status === "completed" && updated.result_image_url) {
              showCompleted(updated.title || "", updated.result_image_url);
            } else if (updated.status === "rejected") {
              showRejected(updated.title || "");
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "thumbnail_submissions" },
          (payload: any) => {
            const deleted = payload.old;
            const deletedId = deleted?.id as string | undefined;
            if (!deletedId) return;

            const isOwnDelete = deleted?.user_email === userEmail;
            const wasKnownPending = pendingIds.has(deletedId);

            if (!isOwnDelete && !wasKnownPending) return;

            const deletedTitle = deleted?.title || pendingTitles.get(deletedId) || "";
            pendingIds.delete(deletedId);
            pendingTitles.delete(deletedId);
            showRejected(deletedTitle);
          }
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [userEmail]);

  if (!notification) return null;

  const rendered = (
    <AnimatePresence>
      {notification.type === "rejected" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-background/85 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-full max-w-2xl rounded-3xl border border-destructive/40 bg-card p-8 sm:p-10 text-center shadow-2xl"
          >
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="text-destructive" size={32} />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
              High Traffic Alert
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-2">
              We couldn't generate your thumbnail{notification.title ? ` for "${notification.title}"` : ""} right now due to high traffic.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-7">
              <span className="text-primary font-semibold">Your credit has been refunded.</span> Please try again in a little while.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="nuclear"
                size="lg"
                onClick={() => {
                  setNotification(null);
                  navigate("/#thumbnail-form");
                }}
              >
                Try Again
              </Button>
              <Button variant="outline" size="lg" onClick={() => setNotification(null)}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[2147483000] w-[92vw] max-w-xl"
        >
          <div className="relative rounded-3xl border border-primary/30 bg-card/95 backdrop-blur-xl p-6 shadow-2xl">
            <button
              onClick={() => setNotification(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PartyPopper className="text-primary" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-foreground text-xl">Your Thumbnail is Ready! 🎉</h3>
                <p className="text-base text-muted-foreground mt-1">
                  {notification.title ? `"${notification.title}"` : "Your thumbnail"} has been completed.
                </p>
                <button
                  onClick={() => {
                    setNotification(null);
                    navigate("/dashboard");
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink size={14} />
                  View in Dashboard
                </button>
              </div>
            </div>

            {notification.resultUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border">
                <img src={notification.resultUrl} alt="Your thumbnail" className="w-full h-44 object-cover" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(rendered, document.body);
};

export default GlobalResultNotification;
