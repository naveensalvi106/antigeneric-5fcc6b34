import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const GlobalResultNotification = () => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let userEmail: string | null = null;

    const setupListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;
      userEmail = session.user.email;

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
              setTitle(updated.title);
              setResultUrl(updated.result_image_url);
              setShow(true);

              // Auto-dismiss after 15 seconds
              setTimeout(() => setShow(false), 15000);
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

  return (
    <AnimatePresence>
      {show && (
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
      )}
    </AnimatePresence>
  );
};

export default GlobalResultNotification;
