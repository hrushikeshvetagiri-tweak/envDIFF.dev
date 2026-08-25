import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do my .env values get sent to your server?",
    a: "Not for the free paste-and-compare mode — the comparison runs entirely in your browser. When you connect a provider, values are used to compute the diff and are never stored.",
  },
  {
    q: "Why can't you diff the actual value for some providers?",
    a: "Providers like Fly.io, GitHub Actions and Cloudflare treat secrets as write-only — you can set them, but the API will never hand the value back. For those we can only tell you a key is missing, not that it differs. We label this clearly rather than overpromising.",
  },
  {
    q: "Why one-time instead of a subscription?",
    a: "This is a tool you reach for occasionally, not daily. A small monthly charge for occasional use tends to be forgotten and disputed rather than valued — a one-time payment matches how the tool is actually used.",
  },
  {
    q: "What happens to a shared link?",
    a: "By default it carries only metadata — which keys are missing or different, not the actual values — and expires automatically.",
  },
  {
    q: "Is there a CLI or MCP server?",
    a: "A free MCP server is planned so Claude Code and Cursor can call EnvDiff directly instead of writing a one-off script. A CLI for CI/CD pipelines (fail a deploy if a required var is missing) is on the roadmap too.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-ink text-silver">
      <div className="mx-auto max-w-3xl px-6 py-28">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.32em] text-accent uppercase">FAQ</p>
          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.4rem)] font-medium tracking-tight">
            Questions, answered
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 60}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors duration-300 hover:text-accent"
                >
                  <span className="font-medium tracking-tight">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-accent transition-transform duration-500",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-sm leading-relaxed text-silver/70">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
