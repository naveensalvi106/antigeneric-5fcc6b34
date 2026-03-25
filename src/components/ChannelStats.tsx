import { CHANNEL_STATS_ROW1, CHANNEL_STATS_ROW2 } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

type ChannelItem = { name: string; subs: string; niche: string; pfp: string };

const MarqueeRow = ({ items, direction }: { items: ChannelItem[]; direction: "left" | "right" }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-3 group">
      <div
        className={`flex gap-4 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ "--marquee-duration": "17s" } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="flex items-center gap-3 px-5 py-3 rounded-xl card-nuclear transition-all duration-300 hover:scale-[1.02] min-w-[220px]"
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
  return (
    <SectionWrapper id="stats">
      <SectionHeader title="Trusted by Top Creators" subtitle="Creators across every niche use AntiGeneric AI to boost their CTR." />
      <div className="space-y-2">
        <MarqueeRow items={CHANNEL_STATS_ROW1} direction="left" />
        <MarqueeRow items={CHANNEL_STATS_ROW2} direction="right" />
      </div>
    </SectionWrapper>
  );
};

export default ChannelStats;
