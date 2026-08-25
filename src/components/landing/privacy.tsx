import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const claims = [
  {
    kicker: "Paste",
    stamp: ["Never", "sent"],
    title: "Compare runs in your browser",
    body: "The diff is JavaScript on your machine. Pasted secrets are never posted to our servers — full stop.",
    scope: "Stays local",
    surface: "bg-ink text-silver",
    stampClass: "text-accent",
  },
  {
    kicker: "Connect",
    stamp: ["Never", "stored"],
    title: "Provider values are discarded",
    body: "If you connect Vercel or Netlify, values compute the diff and go away. We may keep which keys differ — never the value.",
    scope: "Used, then dropped",
    surface: "bg-navy text-silver",
    stampClass: "text-silver",
  },
  {
    kicker: "Share",
    stamp: ["Auto", "expires"],
    title: "Links carry no secrets",
    body: "A teammate link is metadata by default — missing or different keys, not the actual values — and it dies on a timer.",
    scope: "Metadata only",
    surface: "bg-charcoal text-silver",
    stampClass: "text-silver",
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="scroll-mt-24 bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-12">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] tracking-[0.32em] text-ink/45 uppercase">Privacy</p>
              <h2 className="mt-4 text-[clamp(2.2rem,5vw,4rem)] font-medium leading-[1.02] tracking-tight">
                Honest about what touches our servers
              </h2>
            </div>
            <p className="max-w-sm pb-1 text-sm leading-relaxed text-charcoal">
              We can't claim secrets never leave your device the way a native app can. We can claim we never store the values.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="grid lg:grid-cols-3">
        {claims.map((c, i) => (
          <article
            key={c.kicker}
            className={cn(
              "group relative flex min-h-[28rem] flex-col justify-between overflow-hidden px-8 py-12 sm:min-h-[32rem] lg:px-10",
              c.surface
            )}
          >
            <Reveal delay={i * 90}>
              <div className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.28em] uppercase opacity-55">
                <span>0{i + 1}</span>
                <span>{c.kicker}</span>
              </div>
              <p
                className={cn(
                  "mt-12 font-mono text-[clamp(2.4rem,5vw,3.4rem)] leading-[0.92] tracking-tight transition-transform duration-500 group-hover:-translate-y-1",
                  c.stampClass
                )}
              >
                {c.stamp[0]}
                <br />
                {c.stamp[1]}
              </p>
            </Reveal>

            <Reveal delay={i * 90 + 80}>
              <div>
                <h3 className="text-xl font-medium tracking-tight">{c.title}</h3>
                <p className="mt-3 max-w-[18rem] text-sm leading-relaxed opacity-75">{c.body}</p>
                <p className="mt-8 font-mono text-[11px] tracking-[0.28em] uppercase opacity-50">{c.scope}</p>
              </div>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
