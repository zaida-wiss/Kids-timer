import { useEffect, useMemo, useRef, useState } from "react";
import "./timers.css";

type TimerItem = {
  id: number;
  emoji: string;
  total: number; // sekunder
  left: number;  // sekunder
};

const EMOJIS = ["⏱️", "📚", "💻", "☕", "🏃", "🧘", "🎯", "🔥", "🧠", "🧼"];
const MAX_SECONDS = 60 * 60; // 60 min
const STEP = 30; // 30 sek steg (ändra till 60 om du vill bara minuter)

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

export default function Timers(): JSX.Element {
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJIS[0]);
  const [pickSeconds, setPickSeconds] = useState<number>(5 * 60); // vald tid via drag
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Tick: minskar alla timers 1/s
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
    // fånga pekaren så drag fortsätter även om man hamnar lite utanför
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return; // bara när man drar
    setFromPointer(e.clientX);
  };

  return (
    <div className="timersWrap">
      <h2 className="timersTitle">Timers</h2>

      {/* Rad med emoji-pil + lägg till */}
      <div className="topRow">
        <div className="emojiPicker">
          <span className="emojiBig" aria-hidden="true">{selectedEmoji}</span>
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
          <span className="chev" aria-hidden="true">▾</span>
        </div>

        <button className="addBtn" type="button" onClick={addTimer}>
          Lägg till
        </button>
      </div>

      {/* Stor “bassäng” du drar med tummen */}
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
          if (e.key === "ArrowLeft") setPickSeconds((s) => clamp(s - STEP, 0, MAX_SECONDS));
          if (e.key === "ArrowRight") setPickSeconds((s) => clamp(s + STEP, 0, MAX_SECONDS));
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

      {/* Timers som färgade avlånga bassänger */}
      <div className="timerList">
        {timers.map((t) => {
          const pct = (t.left / t.total) * 100;

          return (
            <div key={t.id} className="timerRow">
              <span className="emojiSmall">{t.emoji}</span>

              <div className="pool">
                <div className="poolFill" style={{ width: `${pct}%` }} />
              </div>

              <span className="timeSmall">{formatMMSS(t.left)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
