import * as si from "simple-icons";
import type { SimpleIcon } from "simple-icons";

/**
 * Map a destination URL to an official brand icon (simple-icons).
 * Returns the raw SVG path + brand hex, or null for a generic link.
 */

// domain keyword -> simple-icons export name
const MAP: Record<string, keyof typeof si> = {
  // socials
  "instagram.com": "siInstagram",
  "github.com": "siGithub",
  "x.com": "siX",
  "twitter.com": "siX",
  "youtube.com": "siYoutube",
  "youtu.be": "siYoutube",
  "tiktok.com": "siTiktok",
  "facebook.com": "siFacebook",
  "fb.com": "siFacebook",
  "twitch.tv": "siTwitch",
  "discord.com": "siDiscord",
  "discordapp.com": "siDiscord",
  "discord.gg": "siDiscord",
  "t.me": "siTelegram",
  "telegram.org": "siTelegram",
  "wa.me": "siWhatsapp",
  "whatsapp.com": "siWhatsapp",
  "reddit.com": "siReddit",
  "pinterest.com": "siPinterest",
  "snapchat.com": "siSnapchat",
  "threads.net": "siThreads",
  "mastodon.social": "siMastodon",
  "bsky.app": "siBluesky",
  // music
  "spotify.com": "siSpotify",
  "music.apple.com": "siApplemusic",
  "soundcloud.com": "siSoundcloud",
  "bandcamp.com": "siBandcamp",
  // dev / work
  "dribbble.com": "siDribbble",
  "behance.net": "siBehance",
  "figma.com": "siFigma",
  "medium.com": "siMedium",
  "dev.to": "siDevdotto",
  "stackoverflow.com": "siStackoverflow",
  "gitlab.com": "siGitlab",
  "producthunt.com": "siProducthunt",
  "notion.so": "siNotion",
  "substack.com": "siSubstack",
  // commerce / support
  "patreon.com": "siPatreon",
  "ko-fi.com": "siKofi",
  "buymeacoffee.com": "siBuymeacoffee",
  "paypal.com": "siPaypal",
  "etsy.com": "siEtsy",
  "gumroad.com": "siGumroad",
  "shopify.com": "siShopify",
  // other common
  "calendly.com": "siCalendly",
  "vimeo.com": "siVimeo",
  "dailymotion.com": "siDailymotion",
};

export type ResolvedIcon = { path: string; hex: string; title: string };

function hostOf(url: string): string {
  try {
    if (/^mailto:/i.test(url)) return "mailto";
    if (/^tel:/i.test(url)) return "tel";
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function resolveIcon(url: string): ResolvedIcon | "mail" | "phone" | null {
  const host = hostOf(url);
  if (host === "mailto") return "mail";
  if (host === "tel") return "phone";
  if (!host) return null;

  // exact match, then suffix match (e.g. "m.youtube.com" ends with "youtube.com")
  let key = Object.keys(MAP).find((d) => host === d || host.endsWith(`.${d}`) || host.endsWith(d));
  if (!key) return null;

  const icon = si[MAP[key]] as SimpleIcon | undefined;
  if (!icon) return null;
  return { path: icon.path, hex: `#${icon.hex}`, title: icon.title };
}
