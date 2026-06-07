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
  const fullscreenRequestedRef = useRef(false);

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

  const requestFullscreen = useCallback(() => {
    if (fullscreenRequestedRef.current) return;
    fullscreenRequestedRef.current = true;
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen().catch(() => {});
    }
  }, []);

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
      if (!r && remainingMs <= 0) {
        const sec = durationRef.current;
        setRemainingMs(sec * 1000);
        lastSecondRef.current = sec;
      }
      return !r;
    });
  }, [remainingMs]);

  // Keyboard handling + fullscreen on first interaction
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      requestFullscreen();

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
  }, [toggle, setMinutes, requestFullscreen]);

  const digitStateClass =
    phase === "warning" ? "state-warning" :
    phase === "critical" || phase === "done" ? "state-critical" :
    "";

  return (
    <section className="relative h-screen w-screen">
      <div
        className={`pointer-events-none absolute inset-0 -z-10 tech-grid ${
          phase === "warning" || phase === "critical" ? "tech-grid-pulse" : ""
        }`}
      />

      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
        <div
          key={shakeKey}
          className={`relative flex items-center justify-center ${
            shakeKey > 0 ? "shake" : ""
          }`}
        >
          <ParticleCanvas burstTick={burstTick} />
          <div
            className={`timer-digits ${digitStateClass} relative z-10 flex items-baseline gap-2 sm:gap-4 tabular-nums select-none`}
          >
            <span className="text-[30vw] leading-none">{m}</span>
            <span className="text-[22vw] leading-none opacity-70">:</span>
            <span className="text-[30vw] leading-none">{s}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
