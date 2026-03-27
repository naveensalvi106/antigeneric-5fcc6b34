import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing Google sign-in...");

  useEffect(() => {
    let active = true;

    const goTo = (path: string) => {
      if (!active) return;
      navigate(path, { replace: true });
    };

    const finishAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        goTo("/");
        return true;
      }

      return false;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        goTo("/");
      }
    });

    finishAuth().then((hasSession) => {
      if (hasSession || !active) return;

      setMessage("Signing you in...");

      window.setTimeout(async () => {
        const resolved = await finishAuth();
        if (!resolved) {
          goTo("/login");
        }
      }, 1200);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">Signing you in</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;