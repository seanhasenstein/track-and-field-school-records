import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;

  if (sessionToken) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ sessionToken });
  }

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "sessionToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
  );

  return response;
}
