import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AgentNoteApp } from "@/components/agentnote-app";
import { listNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const notes = await listNotes(userId);
  const owned = notes.some((note) => note.id === id);

  // Missing / unauthorized id: fall back to home without crashing.
  if (!owned) {
    redirect("/");
  }

  return (
    <AgentNoteApp
      initialNotes={notes}
      userId={userId}
      initialSelectedId={id}
    />
  );
}
