import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;

  if (!sessionToken) {
    return Response.json({ user: null }, { status: 401 });
  }

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    sessionToken,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }

  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(session.userId) });

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles,
    },
  });
}
