import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

async function getSessionUser(request: NextRequest) {
  const sessionToken = request.cookies.get("sessionToken")?.value;
  if (!sessionToken) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({
    sessionToken,
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  return user;
}

export async function GET(request: NextRequest) {
  const currentUser = await getSessionUser(request);
  if (!currentUser || !currentUser.roles?.includes("super_admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const db = await getDb();
  const users = await db
    .collection("users")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json(
    users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      roles: u.roles,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }))
  );
}

export async function POST(request: NextRequest) {
  const currentUser = await getSessionUser(request);
  if (!currentUser || !currentUser.roles?.includes("super_admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, roles } = (await request.json()) as {
    email: string;
    roles: string[];
  };

  if (!email || !roles || !Array.isArray(roles)) {
    return Response.json({ error: "Email and roles are required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = await getDb();

  const existing = await db.collection("users").findOne({ email: normalizedEmail });
  if (existing) {
    return Response.json({ error: "User already exists" }, { status: 409 });
  }

  await db.collection("users").insertOne({
    email: normalizedEmail,
    roles,
    createdAt: new Date(),
  });

  return Response.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const currentUser = await getSessionUser(request);
  if (!currentUser || !currentUser.roles?.includes("super_admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, roles } = (await request.json()) as {
    userId: string;
    roles: string[];
  };

  if (!userId || !roles || !Array.isArray(roles)) {
    return Response.json({ error: "userId and roles are required" }, { status: 400 });
  }

  // Prevent removing own super_admin role
  if (userId === currentUser._id.toString() && !roles.includes("super_admin")) {
    return Response.json(
      { error: "You cannot remove your own super_admin role" },
      { status: 400 }
    );
  }

  const db = await getDb();
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(userId) }, { $set: { roles } });

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const currentUser = await getSessionUser(request);
  if (!currentUser || !currentUser.roles?.includes("super_admin")) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = (await request.json()) as { userId: string };

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  // Prevent deleting yourself
  if (userId === currentUser._id.toString()) {
    return Response.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  const db = await getDb();

  // Delete user's sessions too
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
  if (user) {
    await db.collection("sessions").deleteMany({ userId: user._id });
    await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
  }

  return Response.json({ success: true });
}
