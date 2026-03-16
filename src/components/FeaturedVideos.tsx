import { motion } from "framer-motion";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const VIDEO_FILES_ROW1 = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/video3.mp4",
  "/videos/video4.mp4",
  "/videos/video5.mp4",
  "/videos/video6.mp4",
  "/videos/video7.mp4",
  "/videos/video8.mp4",
  "/videos/video9.mp4",
];

const VIDEO_FILES_ROW2 = [
  "/videos/video10.mp4",
  "/videos/video11.mp4",
  "/videos/video12.mp4",
  "/videos/video13.mp4",
  "/videos/video14.mp4",
  "/videos/video15.mp4",
  "/videos/video16.mp4",
  "/videos/video17.mp4",
  "/videos/video18.mp4",
];

const VideoCard = ({ src }: { src: string }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[340px] rounded-xl overflow-hidden bg-card card-nuclear">
    <div className="aspect-video">
      <video
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        onMouseEnter={(e) => e.currentTarget.play()}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      />
    </div>
  </div>
);

const FeaturedVideos = () => {
  const duplicated = [...VIDEO_FILES, ...VIDEO_FILES];

  return (
    <SectionWrapper id="videos">
      <div className="container mx-auto px-4">
        <SectionHeader title="Featured Videos" subtitle="A glimpse of the content we help creators produce." />
      </div>

      {/* Row 1: Left to Right */}
      <div className="overflow-hidden mb-6">
        <div
          className="flex gap-4 animate-marquee-right"
          style={{ "--marquee-duration": "40s", width: "max-content" } as React.CSSProperties}
        >
          {duplicated.map((src, i) => (
            <VideoCard key={`r1-${i}`} src={src} />
          ))}
        </div>
      </div>

      {/* Row 2: Right to Left (empty placeholder) */}
      <div className="overflow-hidden">
        <div
          className="flex gap-4 animate-marquee-left"
          style={{ "--marquee-duration": "45s", width: "max-content" } as React.CSSProperties}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`r2-${i}`}
              className="flex-shrink-0 w-[280px] md:w-[340px] rounded-xl overflow-hidden bg-secondary/30 border border-border/30"
            >
              <div className="aspect-video flex items-center justify-center">
                <span className="text-muted-foreground/40 text-xs">Coming Soon</span>
              </div>
            </div>
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`r2d-${i}`}
              className="flex-shrink-0 w-[280px] md:w-[340px] rounded-xl overflow-hidden bg-secondary/30 border border-border/30"
            >
              <div className="aspect-video flex items-center justify-center">
                <span className="text-muted-foreground/40 text-xs">Coming Soon</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FeaturedVideos;
