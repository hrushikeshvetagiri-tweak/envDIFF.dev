import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import DecryptedText from "@/components/effects/decrypted-text";

export function Hero() {
  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden bg-ink">
      <div className="bg-grid-navy pointer-events-none absolute inset-0 opacity-60" />
      <div className="orb animate-drift pointer-events-none absolute -top-32 -right-24 h-[640px] w-[640px] opacity-70" />
      <div className="orb pointer-events-none absolute -bottom-48 -left-32 h-[420px] w-[420px] opacity-40" />
      <div className="pointer-events-none absolute top-1/2 right-[8%] hidden h-64 w-64 -translate-y-1/2 rounded-full border border-silver/10 lg:block">
        <div className="animate-spin-slow absolute inset-6 rounded-full border border-dashed border-silver/25" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-28 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Reveal>
            <p className="mb-7 font-mono text-[11px] tracking-[0.32em] text-accent uppercase">
              Local ↔ prod · in the browser
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="max-w-xl text-left text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight text-silver">
              <DecryptedText
                text="Catch config drift before it breaks prod"
                animateOn="view"
                sequential
                revealDirection="start"
                speed={28}
                className="text-silver"
                encryptedClassName="font-mono text-silver/35"
              />
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-8 max-w-md text-left text-base leading-relaxed text-silver/70">
              Paste your local <code className="rounded bg-charcoal px-1.5 py-0.5 font-mono text-[0.9em] text-silver">.env</code> next
              to Vercel, Netlify or Railway. See what's missing — in seconds.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/compare">
                <Button size="lg" className="group">
                  Compare two .env files
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <ButtonLink href="#how-it-works" variant="outline" size="lg">
                How it works
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="hidden justify-self-end lg:block">
          <div className="font-mono text-[11px] leading-7 tracking-[0.22em] text-silver/50 uppercase">
            <p>01 — no account</p>
            <p>02 — no install</p>
            <p className="text-silver">03 — nothing leaves the tab</p>
          </div>
        </Reveal>
      </div>

      <p className="pointer-events-none absolute bottom-8 left-6 hidden font-mono text-[10px] tracking-[0.5em] text-silver/40 uppercase [writing-mode:vertical-rl] sm:block">
        Scroll
      </p>
    </section>
  );
}
