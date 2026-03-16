import { Star } from "lucide-react";
import { TESTIMONIALS_ROW1, TESTIMONIALS_ROW2 } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

type TestimonialItem = typeof TESTIMONIALS_ROW1[0];

const TestimonialCard = ({ item }: { item: TestimonialItem }) => (
  <div className="min-w-[300px] md:min-w-[360px] p-5 rounded-xl bg-card/50 backdrop-blur-sm card-nuclear transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-3">
      <img src={item.pfp} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
      <div>
        <p className="font-display font-semibold text-sm text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground font-mono tabular-nums">{item.subs} Subs</p>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Star size={14} strokeWidth={1.5} className="text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-mono tabular-nums text-foreground">{item.rating}</span>
      </div>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">"{item.text}"</p>
  </div>
);

const MarqueeRow = ({ items, direction }: { items: TestimonialItem[]; direction: "left" | "right" }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className={`flex gap-4 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ "--marquee-duration": "45s" } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <SectionWrapper id="testimonials">
      <SectionHeader title="What Creators Say" subtitle="Real feedback from creators we've worked with." />
      <div className="space-y-3">
        <MarqueeRow items={TESTIMONIALS_ROW1} direction="left" />
        <MarqueeRow items={TESTIMONIALS_ROW2} direction="right" />
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
