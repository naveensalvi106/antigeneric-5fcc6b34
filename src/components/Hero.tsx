import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Image, Zap, Download, Upload, User, FileText, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GeneratingOverlay from "@/components/GeneratingOverlay";

const badges = [
  { icon: Sparkles, label: "AI-Powered" },
  { icon: Image, label: "4K Thumbnails" },
  { icon: Zap, label: "Instant Generation" },
  { icon: Download, label: "Download & Use" },
];

const Hero = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showGenerating, setShowGenerating] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "face") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "thumbnail") setThumbnailImage(file);
    else setFaceImage(file);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('thumbnail-uploads')
      .upload(fileName, file);
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('thumbnail-uploads')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    // Check credits
    const { data: creditData } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    if (!creditData || creditData.credits <= 0) {
      toast.error("No credits left! Upgrade your plan to generate more thumbnails.");
      const el = document.querySelector("#pricing");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images if provided
      let thumbnailImageUrl: string | null = null;
      let faceImageUrl: string | null = null;

      if (thumbnailImage) {
        thumbnailImageUrl = await uploadFile(thumbnailImage, 'references');
      }
      if (faceImage) {
        faceImageUrl = await uploadFile(faceImage, 'faces');
      }

      // Insert submission into database
      const submissionId = crypto.randomUUID();
      setLastSubmissionId(submissionId);
      const { error: insertError } = await supabase
        .from('thumbnail_submissions')
        .insert({
          id: submissionId,
          title: title.trim(),
          description: description.trim() || null,
          thumbnail_image_url: thumbnailImageUrl,
          face_image_url: faceImageUrl,
          user_email: user?.email || null,
        });

      if (insertError) throw insertError;

      // Deduct credit
      await supabase.rpc("use_credit" as any, { p_user_id: user.id });

      // Notify admin
      await supabase.functions.invoke('notify-submission', {
        body: {
          title: title.trim(),
          description: description.trim(),
          thumbnailImageUrl,
          faceImageUrl,
          submissionId,
          userEmail: user.email,
        },
      });

      setIsSubmitted(true);
      setShowGenerating(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratingComplete = useCallback(() => {
    setShowGenerating(false);
    toast.success("Your thumbnail is being crafted! We'll notify you when it's ready.");
    // Reset form
    setTitle("");
    setDescription("");
    setThumbnailImage(null);
    setFaceImage(null);
    setIsSubmitted(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (faceInputRef.current) faceInputRef.current.value = "";
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl animate-blob-delay-2" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/6 rounded-full blur-3xl animate-blob-delay-4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-primary/10 animate-radar" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.p
            className="font-display font-semibold text-sm md:text-base tracking-widest uppercase mb-6 bg-gradient-to-r from-primary/60 via-accent/50 to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI Thumbnail Generator
          </motion.p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance mb-6">
            Stop Being Generic.{" "}
            <span className="gradient-text">Start Getting Clicks.</span>
          </h1>

          <motion.p
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Generate scroll-stopping, 4K thumbnails in minutes. Upload a face, add your title, and let AI do the rest.
          </motion.p>

          {/* Thumbnail Generator Form */}
          <motion.div
            id="thumbnail-form"
            className="max-w-2xl mx-auto mb-8 p-6 rounded-2xl card-nuclear border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-4">
              {/* Title Input */}
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
placeholder="Video title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Image Upload */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Upload size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {thumbnailImage ? thumbnailImage.name : "Upload Image"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Optional</p>
                  </div>
                </button>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "thumbnail")} />

                {/* Face Upload */}
                <button
                  type="button"
                  onClick={() => faceInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {faceImage ? faceImage.name : "Face Reaction"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Optional</p>
                  </div>
                </button>
                <input ref={faceInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "face")} />
              </div>

              {/* Description */}
              <textarea
                placeholder="Describe topic in one line..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {/* Generate Button */}
            <div className="mt-5">
              <Button
                variant="nuclear"
                size="xl"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || isSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Request Submitted!
                  </>
                ) : (
                  "Generate Thumbnail"
                )}
              </Button>
            </div>
          </motion.div>

          {/* See Examples */}
          <motion.div
            className="mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <a href="/examples">
              <Button variant="nuclear" size="xl" className="w-full max-w-2xl">
                See Examples
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full card-nuclear text-sm text-muted-foreground font-medium"
              >
                <badge.icon size={16} strokeWidth={1.5} className="text-primary" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <GeneratingOverlay
        isVisible={showGenerating}
        onComplete={handleGeneratingComplete}
        submissionDetails={{
          title: title,
          description: description || undefined,
          hasReferenceImage: !!thumbnailImage,
          hasFaceImage: !!faceImage,
        }}
        submissionId={lastSubmissionId || undefined}
      />
    </section>
  );
};

export default Hero;
