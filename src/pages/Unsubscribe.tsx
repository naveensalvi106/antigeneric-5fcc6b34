import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, MailX } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const validate = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
          headers: { apikey: anonKey },
        });
        const data = await res.json();
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      } catch { setStatus("invalid"); }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Processing...</p>
          </>
        )}
        {status === "valid" && (
          <>
            <MailX className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Unsubscribe from emails?</h1>
            <p className="text-muted-foreground text-sm">You will no longer receive app emails from AntiGeneric AI.</p>
            <Button variant="destructive" onClick={handleUnsubscribe} className="w-full">
              Confirm Unsubscribe
            </Button>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You have been successfully unsubscribed.</p>
          </>
        )}
        {status === "already" && (
          <>
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Already Unsubscribed</h1>
            <p className="text-muted-foreground text-sm">You're already unsubscribed from these emails.</p>
          </>
        )}
        {(status === "invalid" || status === "error") && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Invalid Link</h1>
            <p className="text-muted-foreground text-sm">This unsubscribe link is invalid or has expired.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
