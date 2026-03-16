import { Star, Users } from "lucide-react";
import { TESTIMONIALS } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

const TestimonialCard = ({ item }: { item: typeof TESTIMONIALS[0] }) => (
  <div className="min-w-[300px] md:min-w-[360px] p-5 rounded-xl bg-card/50 backdrop-blur-sm card-nuclear transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
        <Users size={16} strokeWidth={1.5} className="text-primary" />
      </div>
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

const MarqueeRow = ({ items, direction }: { items: typeof TESTIMONIALS; direction: "left" | "right" }) => {
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
  const half = Math.ceil(TESTIMONIALS.length / 2);
  return (
    <SectionWrapper id="testimonials">
      <SectionHeader title="What Creators Say" subtitle="Real feedback from creators we've worked with." />
      <div className="space-y-3">
        <MarqueeRow items={TESTIMONIALS.slice(0, half).concat(TESTIMONIALS.slice(half))} direction="left" />
        <MarqueeRow items={TESTIMONIALS.slice(half).concat(TESTIMONIALS.slice(0, half))} direction="right" />
      </div>
    </SectionWrapper>
  );
};

export default Testimonials;
