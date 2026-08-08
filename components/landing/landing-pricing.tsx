import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pricingTiers } from "@/components/landing/landing-data";

export const LandingPricing = () => {
  return (
    <section id="pricing" className="mb-32">
      <div className="mb-16 text-center">
        <Badge
          variant="outline"
          className="rounded-none border-none bg-transparent p-0 text-xs font-bold tracking-[0.25em] text-text-muted uppercase"
        >
          Simple Plans
        </Badge>
        <h2 className="mt-4 text-5xl font-bold">Pick Your Screen</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {pricingTiers.map((tier) => (
          <Card
            key={tier.name}
            className={`glass-panel relative rounded-3xl border-none bg-transparent p-10 ring-0 transition-all ${
              tier.highlighted
                ? "z-10 transform border-2 border-amber-flame md:scale-105"
                : "border border-white/5 hover:border-amber-flame/30"
            }`}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-flame px-4 py-1 text-xs font-bold tracking-widest text-ink-black uppercase">
                Most Popular
              </Badge>
            )}
            <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-bold">{tier.price}</span>
              <span className="ml-2 text-text-faint">{tier.period}</span>
            </div>
            <ul className="mb-8 space-y-4 text-text-muted">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check
                    className="mr-3 size-3 shrink-0 text-amber-flame"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className={`h-auto w-full rounded-xl py-4 font-bold ${
                tier.highlighted
                  ? "bg-amber-flame text-ink-black hover:bg-white"
                  : "border border-white/10 bg-transparent text-white hover:bg-white/5"
              }`}
              variant={tier.highlighted ? "default" : "outline"}
            >
              {tier.cta}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
};
