import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ParticleCanvas } from "./ParticleCanvas";

type Phase = "idle" | "normal" | "warning" | "critical" | "done";

function format(total: number) {
  const t = Math.max(0, total);
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return { m, s };
}

export function CountdownTimer() {
  const [duration, setDuration] = useState(60); // default 1 min
  const [remainingMs, setRemainingMs] = useState(60_000);
  const [running, setRunning] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [burstTick, setBurstTick] = useState(0);
  const lastSecondRef = useRef<number>(60);
  const endAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const durationRef = useRef(duration);
  const runningRef = useRef(running);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { runningRef.current = running; }, [running]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const { m, s } = format(secondsLeft);

  const phase: Phase = useMemo(() => {
    if (secondsLeft <= 0 && !running) return "done";
    if (secondsLeft <= 10) return "critical";
    if (secondsLeft <= 30) return "warning";
    return "normal";
  }, [secondsLeft, running]);

  const tick = useCallback(() => {
    if (endAtRef.current == null) return;
    const left = Math.max(0, endAtRef.current - performance.now());
    setRemainingMs(left);
    const curSec = Math.ceil(left / 1000);
    if (curSec !== lastSecondRef.current) {
      const prev = lastSecondRef.current;
      lastSecondRef.current = curSec;
      if (curSec <= 10 && curSec >= 0 && prev > curSec) {
        setShakeKey((k) => k + 1);
        setBurstTick((b) => b + 1);
      }
    }
    if (left <= 0) {
      // auto-reset to original duration, stop running
      setRunning(false);
      endAtRef.current = null;
      setTimeout(() => {
        setRemainingMs(durationRef.current * 1000);
        lastSecondRef.current = durationRef.current;
      }, 600);
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

  const setMinutes = useCallback((mins: number) => {
    const sec = mins * 60;
    setRunning(false);
    setDuration(sec);
    setRemainingMs(sec * 1000);
    lastSecondRef.current = sec;
    setBurstTick(0);
    setShakeKey(0);
  }, []);

  const toggle = useCallback(() => {
    setRunning((r) => {
      // if at 0, reset before starting
      if (!r && remainingMs <= 0) {
        const sec = durationRef.current;
        setRemainingMs(sec * 1000);
        lastSecondRef.current = sec;
      }
      return !r;
    });
  }, [remainingMs]);

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        setMinutes(parseInt(e.key, 10));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, setMinutes]);

  const digitStateClass =
    phase === "warning" ? "state-warning" :
    phase === "critical" || phase === "done" ? "state-critical" :
    "";

  return (
    <section className="relative mx-auto w-full max-w-6xl">
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
            <span
              className={`h-2 w-2 rounded-full ${running ? "bg-[color:var(--neon-cyan)]" : "bg-muted-foreground"}`}
              style={running ? { boxShadow: "0 0 12px var(--neon-cyan)" } : undefined}
            />
            <span className="label-mono">
              {running
                ? "Live // counting down"
                : phase === "done"
                ? "Sequence complete"
                : "Standby // press SPACE"}
            </span>
          </div>
          <span className="label-mono hidden sm:inline">
            T-Minus // {Math.floor(duration / 60).toString().padStart(2, "0")}:
            {(duration % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Timer */}
        <div
          key={shakeKey}
          className={`relative flex items-center justify-center py-10 sm:py-20 ${
            shakeKey > 0 ? "shake" : ""
          }`}
        >
          <ParticleCanvas burstTick={burstTick} />
          <div
            className={`timer-digits ${digitStateClass} relative z-10 flex items-baseline gap-2 sm:gap-4 tabular-nums select-none`}
          >
            <span className="text-[24vw] leading-none sm:text-[18rem]">{m}</span>
            <span className="text-[18vw] leading-none opacity-70 sm:text-[14rem]">:</span>
            <span className="text-[24vw] leading-none sm:text-[18rem]">{s}</span>
          </div>
        </div>

        {/* Keyboard legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 label-mono opacity-80">
          <span>
            <kbd className="kbd">1</kbd>–<kbd className="kbd">9</kbd> · set minutes
          </span>
          <span>
            <kbd className="kbd">SPACE</kbd> · {running ? "pause" : "start"}
          </span>
        </div>
      </div>
    </section>
  );
}
