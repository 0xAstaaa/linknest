import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url }) });

async function main() {
  // Single-tenant: wipe and seed exactly one profile.
  await prisma.event.deleteMany({});
  await prisma.link.deleteMany({});
  await prisma.profile.deleteMany({});

  const p = await prisma.profile.create({
    data: {
      name: "Alex Rivera",
      bio: "Designer & builder. Making small useful things on the internet. ☕",
      theme: "noir",
      showIcons: true,
      links: {
        create: [
          { title: "Portfolio", url: "https://example.com", position: 0 },
          { title: "GitHub", url: "https://github.com/torvalds", position: 1 },
          { title: "Instagram", url: "https://instagram.com/nasa", position: 2 },
          { title: "Twitter / X", url: "https://x.com/elonmusk", position: 3 },
          { title: "YouTube", url: "https://youtube.com/@mkbhd", position: 4 },
          { title: "TikTok", url: "https://tiktok.com/@khaby.lame", position: 5 },
          { title: "Spotify", url: "https://open.spotify.com/artist/x", position: 6 },
          { title: "LinkedIn", url: "https://linkedin.com/in/x", position: 7 },
          { title: "Email me", url: "mailto:hello@example.com", position: 8 },
        ],
      },
    },
  });
  // Generate real Event rows across the last 7 days so the analytics chart
  // has genuine time-series data to read (not hardcoded display numbers).
  const links = await prisma.link.findMany({ where: { profileId: p.id } });
  const events = [];
  const now = Date.now();
  for (let d = 6; d >= 0; d--) {
    const dayStart = now - d * 86400000;
    const viewsToday = 8 + Math.floor(Math.random() * 20);
    for (let i = 0; i < viewsToday; i++) {
      const at = new Date(dayStart + Math.floor(Math.random() * 86400000));
      events.push({ type: "view", createdAt: at });
      // ~35% of views produce a click on a random link
      if (Math.random() < 0.35 && links.length) {
        const link = links[Math.floor(Math.random() * links.length)];
        events.push({ type: "click", linkId: link.id, createdAt: at });
      }
    }
  }
  await prisma.event.createMany({ data: events });

  // keep the per-link counters consistent with the generated click events
  for (const link of links) {
    const c = events.filter((e) => e.type === "click" && e.linkId === link.id).length;
    await prisma.link.update({ where: { id: link.id }, data: { clicks: c } });
  }
  const totalViews = events.filter((e) => e.type === "view").length;
  await prisma.profile.update({ where: { id: p.id }, data: { views: totalViews } });

  console.log(`Seeded ${p.name} with ${events.length} real events (${totalViews} views).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
