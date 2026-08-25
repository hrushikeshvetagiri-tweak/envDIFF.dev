import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#how-it-works", hash: "#how-it-works", label: "How it works" },
  { href: "/#integrations", hash: "#integrations", label: "Integrations" },
  { href: "/#privacy", hash: "#privacy", label: "Privacy" },
  { href: "/#pricing", hash: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 p-3 sm:p-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto w-full max-w-5xl overflow-hidden border transition-all duration-500",
          open ? "rounded-[28px]" : "rounded-full",
          scrolled || open
            ? "border-silver/15 bg-ink/80 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            : "border-silver/10 bg-ink/40 backdrop-blur-md"
        )}
      >
        <div className="flex h-14 items-center gap-3 px-2 sm:h-[3.75rem] sm:px-2.5">
          <Link
            to="/"
            className="flex shrink-0 items-center rounded-full px-3 py-1 transition-colors hover:bg-white/5"
          >
            <span className="select-none font-mono text-[1.05rem] font-bold tracking-tight text-silver sm:text-[1.15rem]">
              .envDIFF
            </span>
          </Link>

          {isHome && (
            <nav className="mx-auto hidden items-center rounded-full bg-charcoal/80 p-1 md:flex">
              {links.map((l) => {
                const active = isHome && location.hash === l.hash;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-300",
                      active
                        ? "bg-silver text-ink"
                        : "text-silver/55 hover:bg-ink hover:text-silver"
                    )}
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <Link to="/compare" className="hidden md:block">
              <Button size="sm" className="h-9 rounded-full px-4 pr-3">
                Open the tool
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-silver text-ink transition-colors hover:bg-white md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out md:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-silver/15 px-3 py-3">
              {isHome &&
                links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-2.5 text-sm font-medium text-silver/70 transition-colors hover:bg-charcoal hover:text-silver"
                  >
                    {l.label}
                  </a>
                ))}
              <Link to="/compare" onClick={() => setOpen(false)} className="mt-1">
                <Button size="sm" className="h-11 w-full rounded-full">
                  Open the tool
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
