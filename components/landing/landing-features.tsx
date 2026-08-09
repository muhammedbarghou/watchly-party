"use client";

import { useState } from "react";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { images } from "@/components/landing/landing-data";
import { cn } from "@/lib/utils";

interface FeatureItem {
  id: number;
  title: string;
  image: string;
  description: string;
}

interface LandingFeaturesProps {
  features?: FeatureItem[];
  className?: string;
}

const defaultFeatures: FeatureItem[] = [
  {
    id: 1,
    title: "Watch Together, Perfectly in Sync",
    image: images.syncWaveform,
    description:
      'Every play, pause, and seek happens for everyone at once — no more "wait, pause it, I have to grab a drink" chaos over text.',
  },
  {
    id: 2,
    title: "Your Own Room, Your Rules",
    image: images.stepCreate,
    description:
      "Spin up a room in seconds with a unique code. Keep it private with a password, or open it up — you decide who gets in.",
  },
  {
    id: 3,
    title: "Talk Over It, Not Around It",
    image: images.voiceChat,
    description:
      'Built-in voice chat means you can react in real time, not type "LMAOOO" three seconds after the moment\'s already passed.',
  },
  {
    id: 4,
    title: "Live Chat That Stays in the Room",
    image: images.syncNetwork,
    description:
      "Real-time text chat runs alongside the video — casual, in-the-moment, and it clears out when the room does, so nothing lingers.",
  },
  {
    id: 5,
    title: "See When Your Friends Are Watching",
    image: images.stepInvite,
    description:
      "Add friends and catch their live rooms right from your home page — jump in on movie night without a text thread.",
  },
  {
    id: 6,
    title: "You're the Host",
    image: images.spatial3d,
    description:
      "Room admins control playback, hand the remote to someone else mid-session, and manage who's in the room — kick, mute, or ban if you need to.",
  },
];

const LandingFeatures = ({
  features = defaultFeatures,
  className,
}: LandingFeaturesProps) => {
  const [activeTabId, setActiveTabId] = useState<number | null>(
    features[0]?.id ?? null,
  );
  const [activeImage, setActiveImage] = useState(
    features[0]?.image ?? images.syncWaveform,
  );

  const handleValueChange = (value: string[]) => {
    const nextValue = value[0];
    if (!nextValue) {
      setActiveTabId(null);
      return;
    }

    const nextId = Number(nextValue.replace("item-", ""));
    const nextFeature = features.find((feature) => feature.id === nextId);

    setActiveTabId(nextId);
    setActiveImage(nextFeature?.image ?? features[0].image);
  };

  return (
    <section id="features" className={cn("py-32", className)}>
      <div className="container mx-auto">
        <h2 className="mb-12 text-3xl font-semibold md:text-4xl">Features</h2>
        <div className="flex w-full items-start justify-between gap-12">
          <div className="w-full md:w-1/2">
            <Accordion
              className="w-full"
              value={activeTabId ? [`item-${activeTabId}`] : []}
              onValueChange={handleValueChange}
            >
              {features.map((feature) => (
                <AccordionItem
                  key={feature.id}
                  value={`item-${feature.id}`}
                  className="transition-opacity hover:opacity-80"
                >
                  <AccordionTrigger className="cursor-pointer py-5 no-underline! transition">
                    <h3
                      className={cn(
                        "text-left text-xl",
                        feature.id === activeTabId
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {feature.title}
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <p className="text-base text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="relative mt-4 aspect-4/3 md:hidden">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="rounded-md object-cover"
                        sizes="100vw"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="relative hidden w-1/2 overflow-hidden rounded-xl bg-muted md:block">
            <div className="relative aspect-4/3">
              {features.map((feature) => (
                <Image
                  key={feature.id}
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className={cn(
                    "rounded-md object-cover transition-opacity duration-500",
                    activeImage === feature.image
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                  sizes="50vw"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { LandingFeatures };
