import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  const { email, code } = (await request.json()) as {
    email: string;
    code: string;
  };

  if (!email || !code) {
    return Response.json(
      { error: "Email and code are required" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  const db = await getDb();

  // Find and delete the OTP session (single-use)
  const otpSession = await db.collection("otpSessions").findOneAndDelete({
    identifier: normalizedEmail,
    codeHash,
    expiresAt: { $gt: new Date() },
  });

  if (!otpSession) {
    return Response.json(
      { error: "Invalid or expired code" },
      { status: 401 }
    );
  }

  // Upsert user document
  const userResult = await db.collection("users").findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: { lastLoginAt: new Date() },
      $setOnInsert: {
        email: normalizedEmail,
        roles: ["admin"],
        createdAt: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  const user = userResult!;

  // Create session
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.collection("sessions").insertOne({
    sessionToken,
    userId: user._id,
    roles: user.roles,
    expiresAt,
    createdAt: new Date(),
  });

  // Set cookie
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `sessionToken=${sessionToken}; HttpOnly; ${
      process.env.NODE_ENV === "production" ? "Secure; " : ""
    }SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
  );

  return response;
}
