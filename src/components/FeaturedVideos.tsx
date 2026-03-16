import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { VIDEOS } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const FeaturedVideos = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <SectionWrapper id="videos">
      <div className="container mx-auto px-4">
        <SectionHeader title="Featured Videos" subtitle="A glimpse of the content we help creators produce." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((video, i) => (
            <motion.div
              key={i}
              className="group relative rounded-xl overflow-hidden bg-card card-nuclear cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedVideo(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                    <Play size={24} strokeWidth={1.5} className="text-primary-foreground ml-1" fill="hsl(var(--primary))" />
                  </div>
                </div>
                {/* Shine sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-md bg-primary/20 text-primary backdrop-blur-sm">
                  {video.type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-semibold text-sm text-foreground mb-1 line-clamp-1">{video.title}</h3>
                <p className="text-xs text-muted-foreground">{video.creator}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="relative bg-card rounded-2xl p-6 max-w-2xl w-full card-nuclear"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
              <div className="aspect-video bg-secondary rounded-xl flex items-center justify-center mb-4">
                <p className="text-muted-foreground text-sm">Video will be added here</p>
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">{VIDEOS[selectedVideo].title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{VIDEOS[selectedVideo].creator} · {VIDEOS[selectedVideo].type}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default FeaturedVideos;
