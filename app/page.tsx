import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MemoApp } from "@/components/memo-app";
import { listNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const notes = await listNotes(userId);
  return <MemoApp initialNotes={notes} userId={userId} />;
}
