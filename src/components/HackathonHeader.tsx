export function HackathonHeader() {
  return (
    <header className="mx-auto w-full max-w-5xl">
      <div className="frame-panel relative rounded-xl p-4 sm:p-6">
        <div className="data-stream absolute inset-x-4 top-0 h-[2px] opacity-70" />
        <div className="data-stream absolute inset-x-4 bottom-0 h-[2px] opacity-70" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <a
            href="https://www.eurotech-federation.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--neon-cyan)]/50 bg-background/60 font-[family-name:var(--font-glitch)] text-[color:var(--neon-cyan)] text-sm font-bold"
              style={{ boxShadow: "0 0 14px oklch(0.78 0.17 215 / 0.4)" }}>
              ET
            </div>
            <div className="leading-tight">
              <div className="label-mono">Organized by</div>
              <div className="font-[family-name:var(--font-glitch)] text-sm sm:text-base font-bold tracking-wider text-foreground group-hover:text-[color:var(--neon-cyan)] transition">
                EUROTECH FEDERATION
              </div>
            </div>
          </a>

          <div className="hidden sm:flex flex-col items-center">
            <div className="label-mono text-[color:var(--neon-violet)]">// HACKATHON //</div>
            <div className="font-[family-name:var(--font-glitch)] text-lg font-black tracking-[0.3em] text-foreground"
              style={{ textShadow: "0 0 12px var(--neon-violet), 0 0 24px var(--neon-cyan)" }}>
              EUROTECH
            </div>
          </div>

          <a
            href="https://www.hkengage.gov.hk/"
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center gap-3"
          >
            <div className="leading-tight text-right">
              <div className="label-mono">In cooperation with</div>
              <div className="font-[family-name:var(--font-glitch)] text-sm sm:text-base font-bold tracking-wider text-foreground group-hover:text-[color:var(--neon-violet)] transition">
                HKTE · HK TALENT ENGAGE
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[color:var(--neon-violet)]/50 bg-background/60 font-[family-name:var(--font-glitch)] text-[color:var(--neon-violet)] text-sm font-bold"
              style={{ boxShadow: "0 0 14px oklch(0.65 0.26 295 / 0.45)" }}>
              HK
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}
