import { useState } from "react";
import { Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { UnlockModal } from "@/components/checkout/unlock-modal";
import { useLicense } from "@/hooks/use-license";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    tagline: "Paste and compare, forever.",
    features: ["Paste any two .env files", "Instant client-side diff", "No account, no install"],
    cta: "Start comparing",
    to: "/compare",
    featured: false,
    comingSoon: false,
    purchasable: false,
  },
  {
    name: "EnvDiff",
    price: "₹1,499",
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
    comingSoon: false,
    purchasable: true,
  },
  {
    name: "Monitoring",
    price: "₹499",
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
    comingSoon: true,
    purchasable: false,
  },
];

export function Pricing() {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const { isLicensed, activate } = useLicense();
  const navigate = useNavigate();

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
                {(plan.featured || plan.comingSoon) && (
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    {plan.featured && (
                      <span className="w-fit rounded-full bg-ink px-3 py-1 font-mono text-[11px] tracking-wide">
                        Most useful
                      </span>
                    )}
                    {plan.comingSoon && (
                      <span className="w-fit rounded-full border border-silver/25 px-3 py-1 font-mono text-[11px] tracking-wide text-silver/60">
                        Coming soon
                      </span>
                    )}
                  </div>
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

                {plan.comingSoon ? (
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    className="mt-8 w-full opacity-60"
                    disabled
                    title="Coming soon"
                  >
                    {plan.cta} · Coming soon
                  </Button>
                ) : plan.purchasable ? (
                  <Button
                    variant={plan.featured ? "primary" : "outline"}
                    className="mt-8 w-full"
                    onClick={() => (isLicensed ? navigate("/compare") : setUnlockOpen(true))}
                  >
                    {isLicensed ? "Unlocked — open the tool" : plan.cta}
                  </Button>
                ) : (
                  <Link to={plan.to} className="mt-8">
                    <Button
                      variant={plan.featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <UnlockModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onActivated={(key) => {
          activate(key);
          setUnlockOpen(false);
          navigate("/compare");
        }}
      />
    </section>
  );
}
