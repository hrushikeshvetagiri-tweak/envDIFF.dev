import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    tagline: "Paste and compare, forever.",
    features: ["Paste any two .env files", "Instant client-side diff", "No account, no install"],
    cta: "Start comparing",
    to: "/compare",
    featured: false,
  },
  {
    name: "EnvDiff",
    price: "$19",
    period: "one-time",
    tagline: "Connect providers, save & share.",
    features: [
      "Connect Vercel, Netlify, Railway & more",
      "Save diffs and share a link with your team",
      "Auto-expiring share links",
      "Free updates within this version",
    ],
    cta: "Get EnvDiff",
    to: "/compare",
    featured: true,
  },
  {
    name: "Monitoring",
    price: "$5",
    period: "/mo, optional",
    tagline: "For drift you didn't cause.",
    features: [
      "Background checks on a schedule",
      "Alerts via Slack, email or webhook",
      "Only pay for what's genuinely ongoing",
    ],
    cta: "Notify me at launch",
    to: "/compare",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-ink text-silver">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.32em] text-accent uppercase">Pricing</p>
          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.05] tracking-tight">
            Pay once for the tool. Pay monthly only for what's ongoing.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 120}>
              <div
                className={cn(
                  "relative flex h-full flex-col p-8 transition-transform duration-500 hover:-translate-y-2",
                  plan.featured
                    ? "rounded-[2rem] bg-charcoal text-silver"
                    : "rounded-[2rem] bg-navy"
                )}
              >
                {plan.featured && (
                  <span className="mb-6 w-fit rounded-full bg-ink px-3 py-1 font-mono text-[11px] tracking-wide">
                    Most useful
                  </span>
                )}
                <h3 className="font-medium tracking-tight">{plan.name}</h3>
                <p className="mt-1 text-sm text-silver/70">{plan.tagline}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-5xl font-medium tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-sm text-silver/50">{plan.period}</span>}
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-silver/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.to} className="mt-8">
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
