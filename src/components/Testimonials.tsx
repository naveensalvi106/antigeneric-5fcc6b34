import { Star } from "lucide-react";
import { TESTIMONIALS_ROW1, TESTIMONIALS_ROW2 } from "@/data/siteData";
import { SectionWrapper, SectionHeader } from "@/components/SectionWrapper";

type TestimonialItem = typeof TESTIMONIALS_ROW1[0];

const TestimonialCard = ({ item }: { item: TestimonialItem }) => (
  <div className="w-[200px] md:w-[220px] p-4 rounded-xl card-nuclear transition-all duration-300 hover:scale-[1.02]">
    <div className="flex items-center gap-2 mb-2.5">
      <img src={item.pfp} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="font-display font-semibold text-xs text-foreground truncate">{item.name}</p>
        <div className="flex items-center gap-1">
          <Star size={10} strokeWidth={1.5} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{item.rating}</span>
        </div>
      </div>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">"{item.text}"</p>
  </div>
);

const MarqueeRow = ({ items, direction }: { items: TestimonialItem[]; direction: "left" | "right" }) => {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className={`flex gap-4 w-max ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ "--marquee-duration": "17s" } as React.CSSProperties}
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
