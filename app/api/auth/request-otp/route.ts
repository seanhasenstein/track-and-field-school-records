import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email: string };

  if (!email || typeof email !== "string") {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const db = await getDb();

  // Check if user exists in the users collection
  const user = await db.collection("users").findOne({ email: normalizedEmail });
  if (!user) {
    // Don't reveal whether the email exists
    return Response.json({ success: true });
  }

  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  // Store OTP session
  await db.collection("otpSessions").insertOne({
    identifier: normalizedEmail,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    createdAt: new Date(),
  });

  // Send email via Resend
  const now = new Date();
  const timestamp = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: normalizedEmail,
      subject: `Your verification code is ${code} — ${timestamp}`,
      text: `Your code is ${code}. It expires in 10 minutes.`,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return Response.json({ error: "Failed to send code" }, { status: 500 });
  }

  return Response.json({ success: true });
}
