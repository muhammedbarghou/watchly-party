import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { images } from "@/components/landing/landing-data";

export const LandingFeatures = () => {
  return (
    <section id="features" className="mb-32">
      <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div className="max-w-xl space-y-4">
          <Badge
            variant="outline"
            className="rounded-none border-none bg-transparent p-0 text-xs font-bold tracking-[0.25em] text-text-muted uppercase"
          >
            Why Watchly
          </Badge>
          <h2 className="text-5xl font-bold">
            Built for connection, not just playback.
          </h2>
        </div>
        <p className="max-w-sm text-text-muted">
          Every detail is tuned so the distance disappears and the shared moment
          takes over.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel group relative overflow-hidden rounded-3xl border-none bg-transparent p-8 ring-0 transition-all duration-500 hover:bg-white/5 lg:col-span-2">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Real-time Playback Sync</h3>
              <p className="text-text-muted">
                Frame-perfect synchronization means everyone laughs, gasps, and
                pauses at exactly the same moment — no buffering drift across
                rooms or continents.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Image
                src={images.syncWaveform}
                alt="abstract visualization of perfectly synced audio waveforms, deep crimson and amber glow, dark background"
                width={200}
                height={250}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
              <Image
                src={images.syncDevices}
                alt="close-up of multiple devices showing identical video frames in sync, moody cinematic lighting"
                width={200}
                height={250}
                className="mt-6 aspect-[4/5] w-full rounded-xl object-cover"
              />
              <Image
                src={images.syncNetwork}
                alt="network latency visualization turning into smooth connected lines, dark tech aesthetic"
                width={200}
                height={250}
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </Card>

        <Card className="glass-panel group overflow-hidden rounded-3xl border-none bg-transparent p-8 ring-0 transition-all duration-500 hover:bg-white/5">
          <h3 className="mb-4 text-2xl font-bold">3D Spatial Environment</h3>
          <p className="mb-8 text-text-muted">
            Step inside immersive Three.js theaters you can explore before the
            lights dim.
          </p>
          <Image
            src={images.spatial3d}
            alt="virtual 3D amphitheater with neon-lit seating and a large central screen, dark atmospheric scene, 3D"
            width={400}
            height={400}
            className="aspect-square w-full rounded-xl object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
          />
        </Card>

        <Card className="glass-panel group overflow-hidden rounded-3xl border-none bg-transparent p-8 ring-0 transition-all duration-500 hover:bg-white/5">
          <h3 className="mb-4 text-2xl font-bold">Voice & Text Chat</h3>
          <p className="mb-8 text-text-muted">
            React and talk live with low-latency spatial voice that sounds like
            you&apos;re in the same row.
          </p>
          <Image
            src={images.voiceChat}
            alt="floating translucent chat bubbles and waveform icons in a dark virtual space, glowing amber accents"
            width={400}
            height={400}
            className="aspect-square w-full rounded-xl object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
          />
        </Card>

        <Card className="glass-panel group relative overflow-hidden rounded-3xl border-none bg-transparent p-8 ring-0 transition-all duration-500 hover:bg-white/5 lg:col-span-2">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <Image
                src={images.avatar1}
                alt="stylized 3D avatar character bust, expressive face, dark studio lighting, vibrant colors"
                width={300}
                height={300}
                className="aspect-square w-full rounded-xl object-cover"
              />
              <Image
                src={images.avatar2}
                alt="stylized 3D avatar character bust, different personality, dark studio lighting, vibrant colors"
                width={300}
                height={300}
                className="aspect-square w-full rounded-xl object-cover"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Custom Avatars</h3>
              <p className="text-text-muted">
                Express yourself with fully customizable avatars that react and
                emote alongside the story.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
