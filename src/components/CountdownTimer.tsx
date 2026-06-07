import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ParticleCanvas } from "./ParticleCanvas";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";

type Phase = "idle" | "normal" | "warning" | "critical" | "done";

const PRESETS = [
  { label: "2 MIN", seconds: 120 },
  { label: "1 MIN", seconds: 60 },
  { label: "30 SEC", seconds: 30 },
];

function format(total: number) {
  const t = Math.max(0, total);
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return { m, s };
}

export function CountdownTimer() {
  const [duration, setDuration] = useState(120);
  const [remainingMs, setRemainingMs] = useState(120_000);
  const [running, setRunning] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [burstTick, setBurstTick] = useState(0);
  const lastSecondRef = useRef<number>(Math.ceil(120));
  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const { m, s } = format(secondsLeft);

  const phase: Phase = useMemo(() => {
    if (secondsLeft <= 0 && running === false && remainingMs === 0) return "done";
    if (secondsLeft <= 10) return "critical";
    if (secondsLeft <= 30) return "warning";
    return "normal";
  }, [secondsLeft, running, remainingMs]);

  const tick = useCallback(() => {
    if (endAtRef.current == null) return;
    const left = Math.max(0, endAtRef.current - performance.now());
    setRemainingMs(left);
    const curSec = Math.ceil(left / 1000);
    if (curSec !== lastSecondRef.current) {
      const prev = lastSecondRef.current;
      lastSecondRef.current = curSec;
      // critical seconds: shake + burst on every second change inside <=10
      if (curSec <= 10 && curSec >= 0 && prev > curSec) {
        setShakeKey((k) => k + 1);
        setBurstTick((b) => b + 1);
      }
    }
    if (left <= 0) {
      setRunning(false);
      endAtRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      endAtRef.current = performance.now() + remainingMs;
      lastSecondRef.current = Math.ceil(remainingMs / 1000);
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleSelect = (sec: number) => {
    setRunning(false);
    setDuration(sec);
    setRemainingMs(sec * 1000);
    lastSecondRef.current = sec;
    setBurstTick(0);
    setShakeKey(0);
  };

  const handleReset = () => {
    setRunning(false);
    setRemainingMs(duration * 1000);
    lastSecondRef.current = duration;
    setBurstTick(0);
    setShakeKey(0);
  };

  const togglePlay = () => {
    if (remainingMs <= 0) handleReset();
    setRunning((r) => !r);
  };

  const digitStateClass =
    phase === "warning" ? "state-warning" :
    phase === "critical" || phase === "done" ? "state-critical" :
    "";

  return (
    <section className="relative mx-auto w-full max-w-5xl">
      {/* Warning grid backdrop */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 tech-grid ${
          phase === "warning" || phase === "critical" ? "tech-grid-pulse" : ""
        }`}
      />

      <div
        className={`frame-panel scanlines relative overflow-hidden rounded-xl p-6 sm:p-10 ${
          phase === "warning" || phase === "critical" ? "warning-flash" : ""
        }`}
      >
        {/* Status bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${running ? "bg-[color:var(--neon-cyan)]" : "bg-muted-foreground"}`}
              style={running ? { boxShadow: "0 0 12px var(--neon-cyan)" } : undefined} />
            <span className="label-mono">
              {running ? "Live // counting down" : phase === "done" ? "Sequence complete" : "Standby"}
            </span>
          </div>
          <span className="label-mono hidden sm:inline">
            T-Minus // {Math.floor(duration / 60).toString().padStart(2, "0")}:{(duration % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Timer */}
        <div
          key={shakeKey}
          className={`relative flex items-center justify-center py-8 sm:py-14 ${shakeKey > 0 ? "shake" : ""}`}
        >
          <ParticleCanvas burstTick={burstTick} />
          <div className={`timer-digits ${digitStateClass} relative z-10 flex items-baseline gap-2 sm:gap-4 tabular-nums select-none`}>
            <span className="text-[20vw] leading-none sm:text-[14rem]">{m}</span>
            <span className="text-[14vw] leading-none opacity-70 sm:text-[10rem]">:</span>
            <span className="text-[20vw] leading-none sm:text-[14rem]">{s}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={togglePlay} className="btn-neon primary">
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? "Pause" : remainingMs <= 0 ? "Restart" : "Play"}
          </button>
          <button onClick={handleReset} className="btn-neon violet">
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {/* Presets + slider */}
        <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="label-mono mb-2 flex items-center gap-2">
              <Zap size={12} /> Quick select
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSelect(p.seconds)}
                  className={`btn-neon ${duration === p.seconds ? "violet" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-[240px]">
            <div className="label-mono mb-2 flex items-center justify-between gap-4">
              <span>Custom // {Math.floor(duration / 60)}m {duration % 60}s</span>
            </div>
            <input
              type="range"
              min={10}
              max={600}
              step={5}
              value={duration}
              onChange={(e) => handleSelect(Number(e.target.value))}
              className="cyber-slider"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
