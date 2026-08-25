import { ClipboardPaste, ScanSearch, Share2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: ClipboardPaste,
    step: "01",
    title: "Paste or connect",
    body: "Drop in two .env files, or connect Vercel, Netlify or Railway to pull values automatically instead of copy-pasting.",
    tone: "charcoal" as const,
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "See the diff instantly",
    body: "Every key is checked in one pass — missing on one side, different values, or safely matching.",
    tone: "ink" as const,
  },
  {
    icon: Share2,
    step: "03",
    title: "Share it, don't screenshot it",
    body: "Send a teammate a link straight to the result instead of pasting a screenshot into Slack.",
    tone: "navy" as const,
  },
];

const tones = {
  charcoal: "bg-charcoal text-silver",
  ink: "bg-ink text-silver",
  navy: "bg-navy text-silver",
};

export function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="bg-ink px-6 pt-24 pb-10">
        <Reveal className="mx-auto max-w-6xl">
          <p className="font-mono text-[11px] tracking-[0.32em] text-accent uppercase">How it works</p>
          <h2 className="mt-4 max-w-xl text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.05] tracking-tight text-silver">
            Three steps. No CLI to learn first.
          </h2>
        </Reveal>
      </div>

      {steps.map(({ icon: Icon, step, title, body, tone }, i) => (
        <Reveal key={step} delay={i * 80}>
          <article
            className={cn(
              "group border-t border-white/5 transition-colors duration-500",
              tones[tone]
            )}
          >
            <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 py-16 sm:grid-cols-[7rem_1fr_2fr]">
              <span className="font-mono text-6xl font-medium opacity-40 transition-all duration-500 group-hover:translate-x-2 group-hover:opacity-100">
                {step}
              </span>
              <div>
                <Icon className="mb-4 h-6 w-6 opacity-80 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
                <h3 className="text-2xl font-medium tracking-tight">{title}</h3>
              </div>
              <p className="max-w-md text-sm leading-relaxed opacity-75 sm:justify-self-end">{body}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
