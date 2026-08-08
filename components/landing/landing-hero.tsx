import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { images } from "@/components/landing/landing-data";

export const LandingHero = () => {
  return (
    <section className="relative mb-32 grid items-center gap-12 lg:grid-cols-2">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="space-y-8">
        <span className="text-xs font-bold tracking-[0.25em] text-text-muted uppercase">
          Experience the Future of Social Watching
        </span>
        <h1 className="text-6xl leading-tight font-extrabold lg:text-7xl">
          Your Private Cinema, <br /> Anywhere.
        </h1>
        <p className="max-w-md text-xl text-text-muted">
          Host immersive virtual watch parties with friends. Synchronous video
          playback inside rich 3D theaters — feel the room, wherever you are.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button
            className="group h-auto rounded-full bg-amber-flame px-8 py-4 text-base font-bold text-ink-black hover:bg-white"
            aria-label="Create a room"
          >
            Create a Room
            <ArrowRight className="ml-3 transition-transform group-hover:translate-x-2" />
          </Button>
          <Button
            variant="outline"
            className="h-auto rounded-full border-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/5"
            aria-label="Join with code"
          >
            Join with Code
          </Button>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl shadow-black-cherry/40 ring-1 ring-white/10">
        <Image
          src={images.hero}
          alt="cinematic virtual 3D cinema theater interior with a glowing projection screen, rows of seated spectators"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-transparent opacity-60" />
      </div>
    </section>
  );
};
