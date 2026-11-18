import { prisma } from "@/lib/prisma";

export type DayPoint = { date: string; views: number; clicks: number };
export type Analytics = {
  days: DayPoint[];
  totalViews: number;
  totalClicks: number;
  ctr: number; // click-through rate 0..1
  windowDays: number;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

/** Real time-series from the Event log for the last `windowDays` days. */
export async function getAnalytics(windowDays = 7): Promise<Analytics> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (windowDays - 1));

  const events = await prisma.event.findMany({
    where: { createdAt: { gte: since } },
    select: { type: true, createdAt: true },
  });

  // seed every day in the window with zeroes so the chart has no gaps
  const buckets = new Map<string, DayPoint>();
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dayKey(d);
    buckets.set(key, { date: key, views: 0, clicks: 0 });
  }

  let totalViews = 0;
  let totalClicks = 0;
  for (const e of events) {
    const key = dayKey(e.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (e.type === "view") {
      bucket.views++;
      totalViews++;
    } else if (e.type === "click") {
      bucket.clicks++;
      totalClicks++;
    }
  }

  const days = Array.from(buckets.values());
  const ctr = totalViews > 0 ? totalClicks / totalViews : 0;
  return { days, totalViews, totalClicks, ctr, windowDays };
}
