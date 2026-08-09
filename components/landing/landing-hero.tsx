import Image from "next/image";
import { TextEffect } from '@/components/motion-primitives/text-effect';

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
        <TextEffect as='h1' preset='blur' className="text-6xl leading-tight font-extrabold lg:text-7xl">
          Your Private Cinema, Anywhere.
        </TextEffect>
        <TextEffect per='word' as='p' preset='blur' className="max-w-md text-xl text-text-muted" delay={1}>
          Host immersive virtual watch parties with friends. Synchronous video
          playback inside rich virtual theaters — feel the room, wherever you are.
          </TextEffect>

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
