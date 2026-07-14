import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function requireUserId(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId };
}
