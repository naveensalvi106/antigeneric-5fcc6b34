import { useState, useRef } from "react";
import { Play } from "lucide-react";
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

const VideoCard = ({ src }: { src: string }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (!vid.paused) { vid.pause(); return; }
    try { vid.muted = false; await vid.play(); } catch { vid.muted = true; await vid.play(); }
  };

  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[340px] rounded-xl overflow-hidden bg-card card-nuclear relative group cursor-pointer"
      onClick={() => void togglePlay()}
    >
      <div className="aspect-video relative">
        <video ref={videoRef} src={src} muted loop playsInline preload="metadata" className="w-full h-full object-cover"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollableRow = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`overflow-x-auto scrollbar-hide hover:[&_.marquee-track]:[animation-play-state:paused] ${className || ''}`} style={style}>
    {children}
  </div>
);

const FeaturedVideos = () => {
  const duplicatedRow1 = [...VIDEO_FILES_ROW1, ...VIDEO_FILES_ROW1];
  const duplicatedRow2 = [...VIDEO_FILES_ROW2, ...VIDEO_FILES_ROW2];

  return (
    <SectionWrapper id="videos">
      <div className="container mx-auto px-4">
        <SectionHeader title="See It In Action" subtitle="Watch how creators use AntiGeneric AI to level up their content." />
      </div>

      <ScrollableRow className="mb-6">
        <div className="marquee-track flex gap-4 animate-marquee-right" style={{ "--marquee-duration": "20s", width: "max-content" } as React.CSSProperties}>
          {duplicatedRow1.map((src, i) => (<VideoCard key={`r1-${i}`} src={src} />))}
        </div>
      </ScrollableRow>

      <ScrollableRow>
        <div className="marquee-track flex gap-4 animate-marquee-left" style={{ "--marquee-duration": "22.5s", width: "max-content" } as React.CSSProperties}>
          {duplicatedRow2.map((src, i) => (<VideoCard key={`r2-${i}`} src={src} />))}
        </div>
      </ScrollableRow>
    </SectionWrapper>
  );
};

export default FeaturedVideos;
