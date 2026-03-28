import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Download, Clock, CheckCircle, AlertCircle,
  Image as ImageIcon, Inbox, History, User, LogOut, Home, Sparkles,
  RefreshCw, Mail, X, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GeneratingOverlay from "@/components/GeneratingOverlay";

interface Submission {
  id: string;
  title: string;
  description: string | null;
  thumbnail_image_url: string | null;
  face_image_url: string | null;
  result_image_url: string | null;
  status: string;
  created_at: string | null;
}

type Tab = "inbox" | "history" | "profile";

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [credits, setCredits] = useState<number>(0);
  const [showReadyPopup, setShowReadyPopup] = useState(false);
  const [readyTitle, setReadyTitle] = useState("");
  const [selectedPending, setSelectedPending] = useState<Submission | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      loadSubmissions();
      loadCredits(session.user.id);
    });
  }, []);

  // Realtime: listen for completed thumbnails
  useEffect(() => {
    const channel = supabase
      .channel("submission-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "thumbnail_submissions",
        },
        (payload: any) => {
          const updated = payload.new as Submission;
          if (updated.status === "completed" && updated.result_image_url) {
            // Update local state
            setSubmissions((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
            // Show popup
            setReadyTitle(updated.title);
            setShowReadyPopup(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("thumbnail_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading submissions:", error);
      toast.error("Failed to load your submissions");
    } else {
      setSubmissions((data as Submission[]) || []);
    }
    setLoading(false);
  };

  const loadCredits = async (userId: string) => {
    const { data } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();
    setCredits(data?.credits ?? 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const completedSubmissions = submissions.filter((s) => s.status === "completed");
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: completedSubmissions.length },
    { id: "history", label: "History", icon: History, count: submissions.length },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${title.replace(/\s+/g, "-")}-thumbnail.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("Thumbnail downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-400">
            <CheckCircle size={12} /> Ready
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium bg-yellow-500/10 text-yellow-400">
            <Clock size={12} /> Generating
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground">
            <AlertCircle size={12} /> {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric",
    }) + ", " + d.toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-lg font-bold text-foreground">
              AntiGeneric <span className="gradient-text">AI</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Home size={16} className="mr-1" /> Home
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingSubmissions.length > 0
              ? `${pendingSubmissions.length} thumbnail${pendingSubmissions.length > 1 ? "s" : ""} being generated...`
              : "All thumbnails up to date"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", value: submissions.length, icon: ImageIcon },
            { label: "Ready", value: completedSubmissions.length, icon: CheckCircle },
            { label: "Generating", value: pendingSubmissions.length, icon: Clock },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl card-nuclear border border-primary/10 text-center"
            >
              <stat.icon size={18} className="mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-secondary/50 border border-border/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Inbox - shows completed thumbnails ready to download */}
            {activeTab === "inbox" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No thumbnails yet"
                    description="When your thumbnails are completed, they'll appear here for download."
                  />
                ) : (
                  <>
                    {/* Pending submissions in inbox */}
                    {pendingSubmissions.map((sub, i) => (
                      <motion.div
                        key={sub.id}
                        className="rounded-2xl card-nuclear border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 overflow-hidden cursor-pointer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedPending(sub)}
                      >
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display font-semibold text-foreground text-base truncate">{sub.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDateTime(sub.created_at)} • Generating...
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusBadge(sub.status)}
                            <Button variant="outline" size="sm">
                              <Clock size={14} className="mr-1" /> View Progress
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Completed submissions */}
                    {completedSubmissions.map((sub, i) => (
                      <motion.div
                        key={sub.id}
                        className="rounded-2xl card-nuclear border border-primary/15 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (pendingSubmissions.length + i) * 0.05 }}
                      >
                        {sub.result_image_url && (
                          <div className="relative group">
                            <div className="aspect-video w-full overflow-hidden bg-secondary/30">
                              <img
                                src={sub.result_image_url}
                                alt={sub.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        )}
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display font-semibold text-foreground text-base truncate">{sub.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDateTime(sub.created_at)} • 4K Resolution
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getStatusBadge(sub.status)}
                            {sub.result_image_url && (
                              <Button
                                variant="nuclear"
                                size="default"
                                onClick={() => handleDownload(sub.result_image_url!, sub.title)}
                              >
                                <Download size={16} className="mr-2" /> Download 4K
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* History - shows all submissions */}
            {activeTab === "history" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <EmptyState
                    icon={History}
                    title="No submissions yet"
                    description="Your thumbnail generation history will appear here."
                    action={
                      <Button variant="nuclear" size="sm" onClick={() => navigate("/#thumbnail-form")}>
                        <Sparkles size={14} className="mr-1" /> Generate First Thumbnail
                      </Button>
                    }
                  />
                ) : (
                  submissions.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      className={`p-4 rounded-xl card-nuclear border border-primary/10 ${sub.status === "pending" ? "cursor-pointer hover:border-primary/30" : ""}`}
                      onClick={() => sub.status === "pending" && setSelectedPending(sub)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {(sub.result_image_url || sub.thumbnail_image_url) && (
                            <img
                              src={sub.result_image_url || sub.thumbnail_image_url || ""}
                              alt={sub.title}
                              className="w-16 h-10 object-cover rounded-md border border-border shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm truncate">{sub.title}</h3>
                            {sub.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {sub.description}
                              </p>
                            )}
                            <p className="text-[11px] text-muted-foreground/50 mt-1">
                              {sub.created_at ? new Date(sub.created_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                              }) : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(sub.status)}
                          {sub.result_image_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(sub.result_image_url!, sub.title)}
                            >
                              <Download size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl card-nuclear border border-primary/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={28} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        {user?.user_metadata?.full_name || "User"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Total Thumbnails</p>
                      <p className="text-xl font-bold text-foreground">{submissions.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-green-400">{completedSubmissions.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-semibold text-foreground">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              month: "short", year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Credits Left</p>
                      <p className="text-xl font-bold text-primary">{credits}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="nuclear"
                  className="w-full"
                  onClick={() => navigate("/#thumbnail-form")}
                >
                  <Sparkles size={16} className="mr-2" /> Generate New Thumbnail
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Thumbnail Ready Popup */}
      <AnimatePresence>
        {showReadyPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md mx-4 p-8 rounded-3xl card-nuclear border border-primary/20 shadow-2xl text-center"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <button
                onClick={() => setShowReadyPopup(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <PartyPopper className="w-8 h-8 text-primary" />
              </div>

              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Your Thumbnail is Ready! 🎉
              </h2>
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                <span className="font-semibold text-foreground">"{readyTitle}"</span> has been crafted and is ready for download.
              </p>
              <p className="text-xs text-muted-foreground/70 mb-6">
                You can also check your Gmail inbox for the delivery notification.
              </p>

              <div className="space-y-2">
                <Button
                  variant="nuclear"
                  className="w-full"
                  onClick={() => {
                    setShowReadyPopup(false);
                    setActiveTab("inbox");
                    loadSubmissions();
                  }}
                >
                  <Sparkles size={16} className="mr-2" /> View in Inbox
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowReadyPopup(false);
                    window.location.reload();
                  }}
                >
                  <RefreshCw size={16} className="mr-2" /> Refresh Page
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Progress Overlay */}
      <GeneratingOverlay
        isVisible={!!selectedPending}
        onComplete={() => {
          setSelectedPending(null);
          loadSubmissions();
        }}
        submissionDetails={selectedPending ? {
          title: selectedPending.title,
          description: selectedPending.description || undefined,
          hasReferenceImage: !!selectedPending.thumbnail_image_url,
          hasFaceImage: !!selectedPending.face_image_url,
        } : undefined}
        initialElapsedSeconds={selectedPending?.created_at
          ? Math.min(Math.floor((Date.now() - new Date(selectedPending.created_at).getTime()) / 1000), 600)
          : 0
        }
        showCloseButton={true}
        submissionId={selectedPending?.id}
      />
    </div>
  );
};

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-16">
    <Icon className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
    <p className="text-foreground font-medium mb-1">{title}</p>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {action}
  </div>
);

export default Dashboard;
