import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function Cta() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-32 text-silver">
      <div className="orb pointer-events-none absolute -top-24 right-0 h-[480px] w-[480px] opacity-50" />
      <Reveal className="relative mx-auto max-w-6xl px-6">
        <p className="font-mono text-[11px] tracking-[0.32em] text-accent uppercase">Start now</p>
        <h2 className="mt-4 max-w-2xl text-[clamp(2.4rem,6vw,5rem)] font-medium leading-[0.95] tracking-tight">
          Stop finding out in production.
        </h2>
        <p className="mt-6 max-w-md text-silver/80">
          Paste two files right now. No signup, no install, results in seconds.
        </p>
        <Link to="/compare" className="mt-10 inline-block">
          <Button size="lg" className="group">
            Open the tool
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}
