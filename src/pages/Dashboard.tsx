import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, Download, Clock, CheckCircle, AlertCircle,
  Image as ImageIcon, Inbox, History, User, LogOut, Home, Sparkles,
} from "lucide-react";
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
  status: string;
  created_at: string | null;
}

type Tab = "inbox" | "history" | "profile";

const Dashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/login");
        return;
      }
      setUser(session.user);
      loadSubmissions();
    });
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

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
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
                {completedSubmissions.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No thumbnails ready yet"
                    description="When your thumbnails are completed, they'll appear here for download."
                  />
                ) : (
                  completedSubmissions.map((sub, i) => (
                    <motion.div
                      key={sub.id}
                      className="rounded-2xl card-nuclear border border-primary/15 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {/* Full-width thumbnail preview */}
                      {sub.result_image_url && (
                        <div className="relative group">
                          <div className="aspect-video w-full overflow-hidden bg-secondary/30">
                            <img
                              src={sub.result_image_url}
                              alt={sub.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}

                      {/* Info bar */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-foreground text-base truncate">{sub.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {timeAgo(sub.created_at)} • 4K Resolution
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
                  ))
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
                      className="p-4 rounded-xl card-nuclear border border-primary/10"
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
                      <p className="text-xl font-bold text-primary">1</p>
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
