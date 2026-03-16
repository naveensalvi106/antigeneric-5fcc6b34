import { THUMBNAILS, THUMBNAILS_ROW1, THUMBNAILS_ROW2 } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

type ThumbnailItem = { label: string; image?: string };

const ThumbnailRow = ({ items, direction, speed }: { items: ThumbnailItem[]; direction: "left" | "right"; speed: string }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className={`flex gap-4 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ "--marquee-duration": speed } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.label}-${i}`}
            className="relative w-64 md:w-72 rounded-xl overflow-hidden group transition-all duration-300 hover:scale-105"
          >
            <div className="aspect-video bg-gradient-to-br from-muted to-secondary rounded-xl card-nuclear overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-muted-foreground/40 font-display text-sm">Thumbnail</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary/20 transition-colors duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ThumbnailShowcase = () => {
  const third = Math.ceil(THUMBNAILS.length / 3);
  const r2 = THUMBNAILS.slice(0, third + 1);
  const r3 = THUMBNAILS.slice(third + 1, third * 2 + 1);

  return (
    <SectionWrapper id="thumbnails">
      <SectionHeader title="High-CTR Thumbnail Showcase" subtitle="Designed to stop the scroll and drive clicks." />
      <div className="space-y-3">
        <ThumbnailRow items={THUMBNAILS_ROW1} direction="left" speed="27s" />
        <ThumbnailRow items={THUMBNAILS_ROW2} direction="right" speed="23s" />
        <ThumbnailRow items={[...r3, ...r2]} direction="left" speed="30s" />
      </div>
    </SectionWrapper>
  );
};

export default ThumbnailShowcase;
