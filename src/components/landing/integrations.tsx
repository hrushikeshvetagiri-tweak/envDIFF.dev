import type { ComponentType } from "react";
import { Cloud } from "lucide-react";
import {
  SiVercel,
  SiNetlify,
  SiRailway,
  SiCloudflareworkers,
  SiGithubactions,
  SiGitlab,
  SiFlydotio,
  SiDocker,
  SiRender,
  SiDigitalocean,
} from "@icons-pack/react-simple-icons";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type SiIcon = ComponentType<{ className?: string; size?: number }>;

interface Integration {
  name: string;
  Icon: SiIcon;
  tier: "full" | "keys";
}

const fullRow: Integration[] = [
  { name: "Vercel", Icon: SiVercel, tier: "full" },
  { name: "Netlify", Icon: SiNetlify, tier: "full" },
  { name: "Railway", Icon: SiRailway, tier: "full" },
  { name: "Render", Icon: SiRender, tier: "full" },
  { name: "DigitalOcean", Icon: SiDigitalocean, tier: "full" },
  { name: "Heroku", Icon: Cloud, tier: "full" },
];

const keysRow: Integration[] = [
  { name: "Cloudflare", Icon: SiCloudflareworkers, tier: "keys" },
  { name: "Fly.io", Icon: SiFlydotio, tier: "keys" },
  { name: "GitHub Actions", Icon: SiGithubactions, tier: "keys" },
  { name: "GitLab CI", Icon: SiGitlab, tier: "keys" },
  { name: "Docker Compose", Icon: SiDocker, tier: "keys" },
  { name: "AWS Amplify", Icon: Cloud, tier: "keys" },
];

function Chip({ name, Icon, tier }: Integration) {
  return (
    <div
      title={`${name} — coming soon`}
      className={cn(
        "relative flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 font-mono text-sm opacity-70",
        tier === "full" ? "bg-ink text-silver" : "bg-navy text-silver/80"
      )}
    >
      <Icon className="h-4 w-4 opacity-70" />
      <span>{name}</span>
      <span className="rounded-full border border-silver/25 px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-silver/55 uppercase">
        Soon
      </span>
    </div>
  );
}

export function Integrations() {
  return (
    <section id="integrations" className="overflow-hidden bg-charcoal py-24 text-silver">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.32em] text-accent uppercase">Integrations</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.05] tracking-tight">
            Pull straight from your provider
          </h2>
          <p className="mt-4 max-w-lg text-silver/80">
            Provider connections are on the way. Some will let us read a value back — some only ever let a secret be written. We'll label that honestly.
          </p>
          <p className="mt-3 font-mono text-[11px] tracking-[0.2em] text-silver/45 uppercase">
            Coming soon · being built
          </p>
        </Reveal>
      </div>

      <Reveal delay={100} className="mt-14 space-y-3">
        <div className="mask-fade-x overflow-hidden">
          <div className="animate-marquee flex w-max gap-3 py-1 hover:[animation-play-state:paused]">
            {[...fullRow, ...fullRow].map((item, i) => (
              <Chip key={`${item.name}-${i}`} {...item} />
            ))}
          </div>
        </div>
        <div className="mask-fade-x overflow-hidden">
          <div className="animate-marquee-reverse flex w-max gap-3 py-1 hover:[animation-play-state:paused]">
            {[...keysRow, ...keysRow].map((item, i) => (
              <Chip key={`${item.name}-${i}`} {...item} />
            ))}
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-14 flex max-w-6xl flex-wrap gap-x-10 gap-y-2 px-6 font-mono text-xs text-silver/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-silver/80" /> full value diff
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-silver/40" /> keys only — write-only secrets
        </span>
        <span className="flex items-center gap-1.5 text-silver/40">
          All providers · coming soon
        </span>
      </div>
    </section>
  );
}
