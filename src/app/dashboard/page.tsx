import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { getProfile } from "@/lib/profile";
import { getAnalytics } from "@/lib/analytics";
import { Editor } from "@/components/Editor";

// Auth + DB backed — render at request time.
export const instant = false;

export default async function Dashboard() {
  if (!(await isAuthed())) redirect("/login");

  const [profile, analytics] = await Promise.all([getProfile(), getAnalytics(7)]);

  // Re-mount the editor when the set of link ids changes (e.g. after adding a
  // link) so client state re-seeds from fresh server data.
  const editorKey = `${profile.id}:${profile.links.map((l) => l.id).join(",")}`;
  return <Editor key={editorKey} profile={profile} analytics={analytics} />;
}
