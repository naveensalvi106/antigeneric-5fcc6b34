import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Image, Zap, Download, Upload, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "face") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "thumbnail") setThumbnailImage(file);
    else setFaceImage(file);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
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
                  placeholder="Thumbnail title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              {/* Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Image Upload */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors text-left"
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors text-left"
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
                placeholder="Describe how you want the thumbnail to look..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none"
              />
            </div>

            {/* Generate Button */}
            <div className="mt-5">
              <Button variant="nuclear" size="xl" className="w-full">
                Generate Thumbnail
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
            <a href="#thumbnails">
              <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                See Examples ↓
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
    </section>
  );
};

export default Hero;
