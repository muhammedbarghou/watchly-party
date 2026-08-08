const MarqueeContent = () => (
  <div className="flex items-center space-x-12 px-6">
    <span className="text-outline text-4xl font-black tracking-widest uppercase">
      Watch Together
    </span>
    <div className="relative size-4">
      <div className="absolute inset-0 animate-pulse-dot rounded-full bg-amber-flame" />
      <div className="absolute inset-0 animate-ping rounded-full bg-amber-flame opacity-20" />
    </div>
    <span className="text-outline text-4xl font-black tracking-widest uppercase">
      Watch Together
    </span>
    <div className="relative size-4">
      <div className="absolute inset-0 animate-pulse-dot rounded-full bg-amber-flame" />
    </div>
  </div>
);

export const LandingMarquee = () => {
  return (
    <section
      className="mb-32 overflow-hidden border-y border-white/5 py-6"
      aria-label="Watch together marquee"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
};
