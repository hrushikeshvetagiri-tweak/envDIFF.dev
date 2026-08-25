import ParticleText from "@/components/effects/particle-text";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-silver">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 pt-12 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-silver/70">
          <span className="select-none font-mono font-bold tracking-tight text-silver">.envDIFF</span>
          <span>— catch config drift before it breaks prod.</span>
        </div>
        <p className="text-xs text-silver/40">
          No account required for the free tool. Your pasted values never leave your browser.
        </p>
      </div>

      <div className="relative mx-auto h-[220px] w-full max-w-[1100px] px-6 sm:h-[280px]">
        <ParticleText
          text=".envDIFF"
          particleSize={2}
          density={3}
          color="#C4C5C9"
          highlightColor="#ECECEE"
          scatter={140}
          gatherDuration={1400}
          stagger={380}
          pointerRepel={36}
          repelRadius={110}
          idleDrift={0.4}
          trigger="mount"
          fontSize="clamp(2.5rem, 8.5vw, 5.75rem)"
          fontWeight={700}
          fontFamily="'Geist Mono', ui-monospace, monospace"
          glow={false}
        />
      </div>
    </footer>
  );
}
