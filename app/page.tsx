import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AgentNoteApp } from "@/components/agentnote-app";
import { listNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const notes = await listNotes(userId);
  return <AgentNoteApp initialNotes={notes} userId={userId} />;
}
