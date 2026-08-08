import { Button } from "@/components/ui/button";

export const LandingCta = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-amber-flame p-12 text-center md:p-20">
      <div className="relative z-10 space-y-8">
        <h2 className="text-5xl font-bold text-ink-black md:text-6xl">
          Your Private Cinema, Anywhere.
        </h2>
        <p className="mx-auto max-w-2xl text-xl text-ink-black/70">
          Start a room tonight and bring the theater to your living room — no
          downloads required.
        </p>
        <Button
          variant="outline"
          className="h-auto rounded-full border-2 border-ink-black px-10 py-4 text-base font-bold text-ink-black hover:bg-ink-black hover:text-amber-flame"
          aria-label="Create a room"
        >
          Create a Room
        </Button>
      </div>
    </section>
  );
};
