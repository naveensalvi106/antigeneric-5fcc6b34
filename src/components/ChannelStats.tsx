import { CHANNEL_STATS } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";
import { Users } from "lucide-react";

const MarqueeRow = ({ items, direction }: { items: typeof CHANNEL_STATS; direction: "left" | "right" }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3 group">
      <div
        className={`flex gap-4 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ "--marquee-duration": "35s" } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card card-nuclear transition-all duration-300 hover:scale-[1.02] min-w-[220px]"
          >
            <img src={item.pfp} alt={item.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            <div>
              <p className="font-display font-semibold text-sm text-foreground">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">{item.subs} Subs</span>
                <span className="text-primary/60">•</span>
                <span>{item.niche}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChannelStats = () => {
  const half = Math.ceil(CHANNEL_STATS.length / 2);
  const row1 = CHANNEL_STATS.slice(0, half);
  const row2 = CHANNEL_STATS.slice(half);

  return (
    <SectionWrapper id="stats">
      <SectionHeader title="Trusted by Growing Creators" subtitle="Channels we've helped scale with premium editing and content operations." />
      <div className="space-y-2">
        <MarqueeRow items={[...row1, ...row2]} direction="left" />
        <MarqueeRow items={[...row2, ...row1]} direction="right" />
      </div>
    </SectionWrapper>
  );
};

export default ChannelStats;
