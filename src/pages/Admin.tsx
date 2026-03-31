import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Eye, Calendar, Loader2, Image as ImageIcon, User, FileText, ExternalLink, Upload, Mail, Home, Coins, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Submission {
  id: string;
  title: string;
  description: string | null;
  thumbnail_image_url: string | null;
  face_image_url: string | null;
  result_image_url: string | null;
  user_email: string | null;
  status: string;
  created_at: string | null;
  pipeline_stage: string | null;
}

const Admin = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [creditEmail, setCreditEmail] = useState("");
  const [creditAmount, setCreditAmount] = useState("10");
  const [addingCredits, setAddingCredits] = useState(false);
  const [showCreditPanel, setShowCreditPanel] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  // Realtime subscription for live pipeline updates
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "thumbnail_submissions" },
        () => {
          loadSubmissions();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      toast.error("You don't have admin access");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await loadSubmissions();
  };

  const loadSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("thumbnail_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load submissions");
    else setSubmissions((data as Submission[]) || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleUploadResult = async (submissionId: string, file: File) => {
    setUploadingId(submissionId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `results/${submissionId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('thumbnail-uploads')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('thumbnail-uploads')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('thumbnail_submissions')
        .update({ result_image_url: urlData.publicUrl, status: 'completed' })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      // Find submission to get user email and title
      const sub = submissions.find(s => s.id === submissionId);
      if (sub?.user_email) {
        await supabase.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'result-ready',
            recipientEmail: sub.user_email,
            idempotencyKey: `result-ready-${submissionId}`,
            templateData: {
              title: sub.title,
              resultImageUrl: urlData.publicUrl,
            },
          },
        });
      }

      toast.success("Thumbnail uploaded & email sent to user!");
      await loadSubmissions();
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploadingId(null);
    }
  };

  const triggerUpload = (submissionId: string) => {
    setUploadingId(submissionId);
    uploadRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingId) {
      handleUploadResult(uploadingId, file);
    }
    e.target.value = "";
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Admin glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-[0_0_30px_-10px_hsl(217_91%_60%/0.3)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-foreground">
            AntiGeneric <span className="gradient-text">Admin</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {submissions.length} submissions
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Home size={16} className="mr-1" /> Home
            </Button>
            <Button variant="outline" size="sm" onClick={loadSubmissions}>Refresh</Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Credit Management Toggle */}
        <div className="mb-6 flex gap-3">
          <Button
            variant={showCreditPanel ? "nuclear" : "nuclear-outline"}
            size="sm"
            onClick={() => setShowCreditPanel(!showCreditPanel)}
          >
            <Coins size={16} className="mr-1" /> Manage Credits
          </Button>
        </div>

        {/* Credit Management Panel */}
        {showCreditPanel && (
          <motion.div
            className="mb-6 p-5 rounded-xl card-nuclear border border-primary/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Coins size={18} className="text-primary" /> Add Credits to User
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="User email..."
                value={creditEmail}
                onChange={(e) => setCreditEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40"
              />
              <input
                type="number"
                placeholder="Credits"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="1"
                className="w-24 px-4 py-2.5 rounded-lg bg-background/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary/40"
              />
              <Button
                variant="nuclear"
                size="sm"
                disabled={addingCredits || !creditEmail.trim()}
                onClick={async () => {
                  setAddingCredits(true);
                  try {
                    // Find user by email via get_user_email function - we need to search submissions for user_email
                    // Since we can't query auth.users directly, we use an edge function or RPC
                    const { data, error } = await supabase.rpc("add_credits_by_email" as any, {
                      p_email: creditEmail.trim(),
                      p_credits: parseInt(creditAmount) || 10,
                    });
                    if (error) throw error;
                    if (data) {
                      toast.success(`Added ${creditAmount} credits to ${creditEmail}`);
                      setCreditEmail("");
                    } else {
                      toast.error("User not found with that email");
                    }
                  } catch (err: any) {
                    toast.error("Failed: " + (err.message || "Unknown error"));
                  } finally {
                    setAddingCredits(false);
                  }
                }}
              >
                {addingCredits ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Enter the user's email and number of credits to add after verifying PayPal payment.</p>
          </motion.div>
        )}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No submissions yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((sub, index) => (
              <motion.div
                key={sub.id}
                className="p-5 rounded-xl card-nuclear border border-primary/10 hover:border-primary/20 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedSubmission(selectedSubmission?.id === sub.id ? null : sub)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-primary truncate">{sub.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        sub.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : sub.status === 'completed'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {sub.status}
                      </span>
                      {sub.pipeline_stage && sub.status === 'pending' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400 flex items-center gap-1">
                          <Loader2 size={10} className="animate-spin" />
                          {sub.pipeline_stage.replace(/_/g, ' ')}
                        </span>
                      )}
                      {sub.pipeline_stage?.startsWith('error') && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400">
                          {sub.pipeline_stage}
                        </span>
                      )}
                    </div>
                    {sub.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{sub.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/60 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      {sub.user_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {sub.user_email}
                        </span>
                      )}
                      {sub.thumbnail_image_url && (
                        <span className="flex items-center gap-1">
                          <ImageIcon size={12} /> Image
                        </span>
                      )}
                      {sub.face_image_url && (
                        <span className="flex items-center gap-1">
                          <User size={12} /> Face
                        </span>
                      )}
                      {sub.result_image_url && (
                        <span className="flex items-center gap-1 text-green-400">
                          <ImageIcon size={12} /> Result uploaded
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    <Eye size={16} />
                  </Button>
                </div>

                {/* Expanded details */}
                {selectedSubmission?.id === sub.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-border/50 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                      <p className="text-sm text-foreground">{sub.description || "No description provided"}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sub.thumbnail_image_url && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Reference Image</p>
                          <a href={sub.thumbnail_image_url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={sub.thumbnail_image_url} alt="Reference" className="w-full h-40 object-cover rounded-lg border border-border" />
                            <span className="text-xs text-primary flex items-center gap-1 mt-1"><ExternalLink size={10} /> Open full size</span>
                          </a>
                        </div>
                      )}
                      {sub.face_image_url && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Face Image</p>
                          <a href={sub.face_image_url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={sub.face_image_url} alt="Face" className="w-full h-40 object-cover rounded-lg border border-border" />
                            <span className="text-xs text-primary flex items-center gap-1 mt-1"><ExternalLink size={10} /> Open full size</span>
                          </a>
                        </div>
                      )}
                      {sub.result_image_url && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Result Thumbnail</p>
                          <a href={sub.result_image_url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={sub.result_image_url} alt="Result" className="w-full h-40 object-cover rounded-lg border border-green-500/30" />
                            <span className="text-xs text-green-400 flex items-center gap-1 mt-1"><ExternalLink size={10} /> Open full size</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Upload result & Delete buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button
                        variant="nuclear"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); triggerUpload(sub.id); }}
                        disabled={uploadingId === sub.id}
                      >
                        {uploadingId === sub.id ? (
                          <><Loader2 size={14} className="mr-1 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload size={14} className="mr-1" /> {sub.result_image_url ? "Replace Result" : "Upload Result"}</>
                        )}
                      </Button>
                      {sub.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!confirm("Reject this submission? The user will be notified and their credit will be refunded.")) return;
                            try {
                              // Refund the credit
                              if (sub.user_email) {
                                await supabase.rpc("add_credits_by_email" as any, {
                                  p_email: sub.user_email,
                                  p_credits: 1,
                                });
                              }
                              // Delete the submission
                              const { error } = await supabase
                                .from("thumbnail_submissions")
                                .delete()
                                .eq("id", sub.id);
                              if (error) throw error;

                              // Notify user via email
                              if (sub.user_email) {
                                await supabase.functions.invoke("send-transactional-email", {
                                  body: {
                                    templateName: "submission-rejected",
                                    recipientEmail: sub.user_email,
                                    idempotencyKey: `rejected-${sub.id}`,
                                    templateData: { title: sub.title },
                                  },
                                });
                              }

                              toast.success("Submission rejected, credit refunded & user notified");
                              setSelectedSubmission(null);
                              await loadSubmissions();
                            } catch (err: any) {
                              toast.error("Failed: " + (err.message || "Unknown error"));
                            }
                          }}
                        >
                          <Trash2 size={14} className="mr-1" /> Reject & Refund
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground/60">ID: {sub.id}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
