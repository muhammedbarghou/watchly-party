import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { howItWorksSteps } from "@/components/landing/landing-data";

export const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="mb-32">
      <div className="mb-20 text-center">
        <Badge
          variant="outline"
          className="rounded-none border-none bg-transparent p-0 text-xs font-bold tracking-[0.25em] text-text-muted uppercase"
        >
          Get Started
        </Badge>
        <h2 className="mt-4 text-5xl font-bold">How it Works</h2>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div
          className="absolute left-4 h-full w-px bg-white/10 md:left-1/2 md:-translate-x-1/2"
          aria-hidden="true"
        />

        {howItWorksSteps.map((step) => (
          <div
            key={step.title}
            className={`group relative mb-20 flex flex-col items-center last:mb-0 ${
              step.reverse ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div
              className={`mb-8 pl-12 md:mb-0 md:w-1/2 ${
                step.reverse
                  ? "md:pl-12 md:text-right"
                  : "md:pr-12 md:pl-0"
              }`}
            >
              <Card className="glass-panel inline-block transform rounded-2xl border-none bg-transparent p-6 ring-0 transition-transform group-hover:-translate-y-2">
                <span className="text-sm font-bold text-amber-flame">
                  {step.step}
                </span>
                <h3 className="mt-2 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-text-muted">{step.description}</p>
              </Card>
            </div>

            <div
              className="absolute left-4 z-10 size-8 -translate-x-1/2 rounded-full border-4 border-surface-base bg-amber-flame md:left-1/2"
              aria-hidden="true"
            />

            <div
              className={`pl-12 md:w-1/2 ${
                step.reverse ? "md:pr-12 md:pl-0" : "md:pl-12"
              }`}
            >
              <Image
                src={step.image}
                alt={step.imageAlt}
                width={500}
                height={500}
                className="aspect-square w-full rounded-xl object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
