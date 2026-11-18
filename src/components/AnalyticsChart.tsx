"use client";

import { useState } from "react";
import type { DayPoint } from "@/lib/analytics";

type Props = {
  days: DayPoint[];
  totalViews: number;
  totalClicks: number;
  ctr: number;
};

export function AnalyticsChart({ days, totalViews, totalClicks, ctr }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...days.map((d) => Math.max(d.views, d.clicks)));
  const W = 600;
  const H = 160;
  const padX = 8;
  const padTop = 12;
  const padBottom = 22;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBottom;
  const n = days.length;
  const step = n > 1 ? plotW / (n - 1) : 0;

  const x = (i: number) => padX + i * step;
  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  const line = (key: "views" | "clicks") =>
    days.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d[key]).toFixed(1)}`).join(" ");

  const areaViews = `${line("views")} L ${x(n - 1).toFixed(1)} ${padTop + plotH} L ${x(0).toFixed(1)} ${padTop + plotH} Z`;

  const fmtDay = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString([], { month: "short", day: "numeric" });

  const hv = hover != null ? days[hover] : null;

  return (
    <div>
      {/* headline stats */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Metric label="Views" value={totalViews} sub={`${days.length}d`} />
        <Metric label="Clicks" value={totalClicks} sub={`${days.length}d`} />
        <Metric label="CTR" value={`${(ctr * 100).toFixed(0)}%`} sub="click rate" />
      </div>

      {/* legend */}
      <div className="mb-2 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} /> Views
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: "#e8e4d8" }} /> Clicks
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Views and clicks over time"
        >
          {/* baseline */}
          <line x1={padX} y1={padTop + plotH} x2={W - padX} y2={padTop + plotH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* views area (subtle fill) */}
          <path d={areaViews} fill="rgba(255,255,255,0.06)" />
          {/* views line */}
          <path d={line("views")} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* clicks line (accent) */}
          <path d={line("clicks")} fill="none" stroke="#e8e4d8" strokeWidth="2" strokeDasharray="1 5" strokeLinejoin="round" strokeLinecap="round" />

          {/* hover points */}
          {hv && hover != null && (
            <>
              <line x1={x(hover)} y1={padTop} x2={x(hover)} y2={padTop + plotH} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
              <circle cx={x(hover)} cy={y(hv.views)} r="3.5" fill="#fff" />
              <circle cx={x(hover)} cy={y(hv.clicks)} r="3.5" fill="#e8e4d8" />
            </>
          )}

          {/* hit areas */}
          {days.map((_, i) => (
            <rect
              key={i}
              x={x(i) - step / 2}
              y={0}
              width={Math.max(step, 12)}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {/* x labels: first, middle, last */}
          {[0, Math.floor(n / 2), n - 1].map((i) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-white/35" style={{ fontSize: 9, fontFamily: "var(--font-geist-mono)" }}>
              {fmtDay(days[i].date)}
            </text>
          ))}
        </svg>

        {/* tooltip */}
        {hv && (
          <div className="pointer-events-none absolute left-2 top-0 rounded-md border border-white/15 bg-black/80 px-3 py-2 text-xs backdrop-blur">
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/50">{fmtDay(hv.date)}</div>
            <div className="mt-1 flex gap-3">
              <span>{hv.views} views</span>
              <span className="text-[#e8e4d8]">{hv.clicks} clicks</span>
            </div>
          </div>
        )}
      </div>

      {totalViews === 0 && totalClicks === 0 && (
        <p className="mt-4 text-center text-xs text-white/40">
          No activity yet — share your page and real numbers will appear here.
        </p>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">{label}</div>
      <div className="font-display mt-1 text-3xl leading-none">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-[10px] text-white/30">{sub}</div>
    </div>
  );
}
