import { useEffect, useMemo, useRef, useState } from "react";
import "./timers.css";

type TimerItem = {
  id: number;
  emoji: string;
  total: number; // sekunder
  left: number;  // sekunder
  color: string; // färg per timer
};

const EMOJIS = ["⏱️", "📚", "💻", "☕", "🏃", "🧘", "🎯", "🔥", "🧠", "🧼"];
const MAX_SECONDS = 60 * 60; // 60 min
const STEP = 30; // 30 sek steg

const COLORS = [
  "#22c55e",
  "#06b6d4",
  "#a78bfa",
  "#fb7185",
  "#f59e0b",
  "#60a5fa",
  "#34d399",
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(n: number, step: number) {
  return Math.round(n / step) * step;
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function pickRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function Timers(): JSX.Element {
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJIS[0]);
  const [pickSeconds, setPickSeconds] = useState<number>(5 * 60);
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimers((prev) =>
        prev
          .map((t) => ({ ...t, left: t.left > 0 ? t.left - 1 : 0 }))
          .filter((t) => t.left > 0)
      );
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  const pickLabel = useMemo(() => formatMMSS(pickSeconds), [pickSeconds]);

  const addTimer = () => {
    if (pickSeconds <= 0) return;

    const t: TimerItem = {
      id: Date.now(),
      emoji: selectedEmoji,
      total: pickSeconds,
      left: pickSeconds,
      color: pickRandomColor(), // ✅ här!
    };

    setTimers((prev) => [t, ...prev]);
  };

  const setFromPointer = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = clamp(clientX - r.left, 0, r.width);
    const ratio = r.width === 0 ? 0 : x / r.width;

    const rawSeconds = ratio * MAX_SECONDS;
    const snapped = snap(rawSeconds, STEP);
    setPickSeconds(clamp(snapped, 0, MAX_SECONDS));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    setFromPointer(e.clientX);
  };

  return (
    <div className="timersWrap">
      <h2 className="timersTitle">Timers</h2>

      <div className="topRow">
        <div className="emojiPicker">
          <span className="emojiBig" aria-hidden="true">
            {selectedEmoji}
          </span>

          <select
            className="emojiSelect"
            value={selectedEmoji}
            onChange={(e) => setSelectedEmoji(e.target.value)}
            aria-label="Välj symbol"
          >
            {EMOJIS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <span className="chev" aria-hidden="true">
            ▾
          </span>
        </div>

        <button className="addBtn" type="button" onClick={addTimer}>
          Lägg till
        </button>
      </div>

      <div className="pickHeader">
        <span>Välj tid</span>
        <span className="pickTime">{pickLabel}</span>
      </div>

      <div
        ref={barRef}
        className="pickBar"
        role="slider"
        aria-label="Ställ in tid"
        aria-valuemin={0}
        aria-valuemax={MAX_SECONDS}
        aria-valuenow={pickSeconds}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")
            setPickSeconds((s) => clamp(s - STEP, 0, MAX_SECONDS));
          if (e.key === "ArrowRight")
            setPickSeconds((s) => clamp(s + STEP, 0, MAX_SECONDS));
        }}
      >
        <div
          className="pickFill"
          style={{ width: `${(pickSeconds / MAX_SECONDS) * 100}%` }}
        />
        <div
          className="pickThumb"
          style={{ left: `${(pickSeconds / MAX_SECONDS) * 100}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="pickMeta">
        <span>0:00</span>
        <span>60:00</span>
      </div>

      <div className="timerList">
        {timers.map((t) => {
          const pct = (t.left / t.total) * 100;

          return (
            <div key={t.id} className="timerRow">
              <span className="emojiSmall">{t.emoji}</span>

              <div className="pool">
                <div
                  className="poolFill"
                  style={{ width: `${pct}%`, background: t.color }}
                />
              </div>

              <span className="timeSmall">{formatMMSS(t.left)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
