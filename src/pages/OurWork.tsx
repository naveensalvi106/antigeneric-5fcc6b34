import { useState, useRef } from "react";
import { Play, Pause, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface VideoSection {
  title: string;
  videos: string[];
}

const SECTIONS: VideoSection[] = [
  {
    title: "Motion Graphics",
    videos: [
      "/videos/mg1.mp4",
      "/videos/mg2.mp4",
      "/videos/mg3.mp4",
      "/videos/mg4.mp4",
      "/videos/mg5.mp4",
      "/videos/mg6.mp4",
    ],
  },
  {
    title: "Long Form",
    videos: [
      "/videos/lf1.mp4",
      "/videos/lf2.mp4",
      "/videos/lf3.mp4",
      "/videos/lf4.mp4",
      "/videos/lf5.mp4",
      "/videos/lf6.mp4",
      "/videos/lf7.mp4",
      "/videos/lf8.mp4",
      "/videos/lf9.mp4",
      "/videos/lf10.mp4",
    ],
  },
  {
    title: "Short Form",
    videos: [
      "/videos/sf1.mp4",
      "/videos/sf2.mp4",
      "/videos/sf3.mp4",
      "/videos/sf4.mp4",
      "/videos/sf5.mp4",
      "/videos/sf6.mp4",
      "/videos/sf7.mp4",
    ],
  },
];

const WorkVideoCard = ({ src }: { src: string }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) {
      vid.pause();
    } else {
      vid.play();
    }
    setPlaying(!playing);
  };

  return (
    <div
      className="rounded-xl overflow-hidden bg-card border border-border relative group cursor-pointer"
      onClick={togglePlay}
    >
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover"
          onEnded={() => setPlaying(false)}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

const OurWork = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-display text-xl font-bold gradient-text">Our Work</h1>
        </div>
      </div>

      {/* Sections */}
      <div className="container mx-auto px-4 py-12">
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-16">
            <h2 className="font-display text-2xl md:text-4xl font-bold gradient-text mb-8">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.videos.map((src, i) => (
                <WorkVideoCard key={`${section.title}-${i}`} src={src} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurWork;
