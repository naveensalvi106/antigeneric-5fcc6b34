export const WHATSAPP_BASE = "https://wa.me/919358795758";

export const CHANNEL_STATS = [
  { name: "Apex Plays", subs: "125K", niche: "Gaming" },
  { name: "Money Forge", subs: "312K", niche: "Finance" },
  { name: "Creator Pulse", subs: "89K", niche: "Vlogs" },
  { name: "DarkLore", subs: "540K", niche: "Commentary" },
  { name: "Pixel Vault", subs: "210K", niche: "Gaming" },
  { name: "Hustle Hive", subs: "1.2M", niche: "Education" },
  { name: "Clutch Arena", subs: "76K", niche: "Gaming" },
  { name: "Growth Theory", subs: "430K", niche: "Finance" },
];

export const VIDEOS = [
  { title: "The $10M Strategy Nobody Talks About", creator: "Money Forge", type: "High Retention Edit" },
  { title: "I Survived 100 Days in Hardcore", creator: "Apex Plays", type: "Gaming Edit" },
  { title: "Why Every Creator Needs This System", creator: "Growth Theory", type: "Storytelling Edit" },
  { title: "The Dark Truth Behind Viral Content", creator: "DarkLore", type: "Commentary Edit" },
  { title: "From 0 to 100K in 90 Days", creator: "Creator Pulse", type: "Documentary Edit" },
  { title: "Building a 7-Figure Brand Online", creator: "Hustle Hive", type: "Premium Edit" },
];

export const THUMBNAILS_ROW1 = [
  { label: "Gaming", image: "/thumbnails/t1.avif" },
  { label: "Finance", image: "/thumbnails/t2.avif" },
  { label: "Commentary", image: "/thumbnails/t3.avif" },
  { label: "Shorts", image: "/thumbnails/t4.avif" },
  { label: "Documentary", image: "/thumbnails/t5.avif" },
  { label: "Education", image: "/thumbnails/t6.avif" },
  { label: "Vlogs", image: "/thumbnails/t7.avif" },
  { label: "Tech", image: "/thumbnails/t8.avif" },
  { label: "Lifestyle", image: "/thumbnails/t9.avif" },
  { label: "Gaming", image: "/thumbnails/t10.avif" },
];

export const THUMBNAILS_ROW2 = [
  { label: "Gaming", image: "/thumbnails/r2-1.avif" },
  { label: "Finance", image: "/thumbnails/r2-2.avif" },
  { label: "Commentary", image: "/thumbnails/r2-3.avif" },
  { label: "Shorts", image: "/thumbnails/r2-4.avif" },
  { label: "Documentary", image: "/thumbnails/r2-5.avif" },
  { label: "Education", image: "/thumbnails/r2-6.avif" },
  { label: "Vlogs", image: "/thumbnails/r2-7.jpg" },
  { label: "Tech", image: "/thumbnails/r2-8.avif" },
  { label: "Lifestyle", image: "/thumbnails/r2-9.avif" },
  { label: "Gaming", image: "/thumbnails/r2-10.jpg" },
];

export const THUMBNAILS_ROW3 = [
  { label: "Gaming", image: "/thumbnails/r3-1.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-2.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-3.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-4.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-5.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-6.jpeg" },
  { label: "Gaming", image: "/thumbnails/r3-7.jpg" },
  { label: "Gaming", image: "/thumbnails/r3-8.jpg" },
  { label: "Gaming", image: "/thumbnails/r3-9.jpg" },
];

export const TESTIMONIALS = [
  { name: "Creator Boost", subs: "98K", rating: 4.9, text: "Retention instantly improved. The pacing and cuts feel way more professional." },
  { name: "Echo Plays", subs: "220K", rating: 5.0, text: "Best editing team I've worked with. They understand the YouTube algorithm." },
  { name: "Hustle Deck", subs: "410K", rating: 4.8, text: "Thumbnails are insane. CTR went up 40% in the first month." },
  { name: "Pixel Rush", subs: "67K", rating: 4.9, text: "They handle everything. I just record and they do the magic." },
  { name: "Money Decode", subs: "305K", rating: 5.0, text: "Professional, fast, and they actually care about your growth." },
  { name: "StoryCraft", subs: "150K", rating: 4.7, text: "The storytelling edits transformed my content. Subscribers love the new style." },
];

export const PRICING = [
  {
    name: "Basic Editing",
    description: "Simple cuts, trims, audio fix (1–10 min)",
    price: "$40 – $120",
    per: "per video",
    features: ["Clean cuts & trims", "Audio cleanup", "Basic transitions", "Free basic thumbnail"],
    popular: false,
    waLink: `${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20am%20interested%20in%20the%20Basic%20Editing%20plan.%20Can%20you%20tell%20me%20the%20work%20process%3F`,
  },
  {
    name: "Creative Editing",
    description: "Transitions, music sync, subtitles, minor graphics (5–20 min)",
    price: "$150 – $300",
    per: "per video",
    features: ["Dynamic transitions", "Music sync & SFX", "Subtitles & captions", "Minor motion graphics", "Free intermediate thumbnail"],
    popular: true,
    waLink: `${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20am%20interested%20in%20the%20Creative%20Editing%20plan.%20Can%20you%20tell%20me%20the%20work%20process%3F`,
  },
  {
    name: "Premium / Cinematic",
    description: "Storytelling, color grading, advanced motion graphics",
    price: "$200 – $400+",
    per: "per project",
    features: ["Cinematic storytelling", "Color grading", "Advanced motion graphics", "Sound design", "Free viral thumbnail"],
    popular: false,
    waLink: `${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20am%20interested%20in%20the%20Premium%20%2F%20Cinematic%20plan.%20Can%20you%20tell%20me%20the%20work%20process%3F`,
  },
  {
    name: "Social Media / Shorts",
    description: "Short edits with motion graphics, bundles available",
    price: "$40 – $80",
    per: "each / bundles from $300",
    features: ["Motion graphics shorts", "Vertical format optimization", "Trending audio sync", "10-video bundle option"],
    popular: false,
    waLink: `${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20am%20interested%20in%20the%20Social%20Media%20%2F%20Shorts%20plan.%20Can%20you%20tell%20me%20the%20work%20process%3F`,
  },
];

export const FAQS = [
  {
    q: "How does the work process start?",
    a: "Once you contact us on WhatsApp, we discuss your content style, editing needs, video type, turnaround time, and goals. Then we guide you through the complete workflow.",
  },
  {
    q: "Do you provide thumbnails too?",
    a: "Yes. Every plan includes a thumbnail level depending on the package — from basic to premium viral-style thumbnails.",
  },
  {
    q: "How do I send my footage?",
    a: "We will guide you after contact. Usually creators share footage via Google Drive, Dropbox, or similar cloud storage.",
  },
  {
    q: "What niches do you work with?",
    a: "We work with creators across gaming, commentary, finance, education, vlogs, short-form content, and more.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery depends on project complexity and volume, but turnaround time is discussed clearly before starting.",
  },
  {
    q: "Can I order shorts in bulk?",
    a: "Yes. We offer single short edits and bundle pricing for creators who need consistent short-form content.",
  },
  {
    q: "Can I ask for revisions?",
    a: "Yes. Revisions can be discussed depending on the plan and project scope.",
  },
];

export const CONTACTS = [
  {
    type: "WhatsApp",
    display: "+91 93587 95758",
    link: `${WHATSAPP_BASE}?text=Hi%20Nuclear%20Edits,%20I%20want%20to%20talk%20about%20your%20services.`,
    icon: "MessageCircle" as const,
  },
  {
    type: "Gmail",
    display: "nuclearedithq@gmail.com",
    link: "mailto:nuclearedithq@gmail.com",
    icon: "Mail" as const,
  },
  {
    type: "Discord",
    display: "nuclearedits",
    link: "https://discord.com/",
    icon: "Gamepad2" as const,
  },
  {
    type: "Instagram",
    display: "@nuclear.editshq",
    link: "https://instagram.com/nuclear.editshq",
    icon: "Instagram" as const,
  },
];

export const NAV_LINKS = [
  { label: "Videos", href: "#videos" },
  { label: "Thumbnails", href: "#thumbnails" },
  { label: "Feedback", href: "#testimonials" },
  { label: "Plans", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];
