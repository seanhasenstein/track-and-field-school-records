import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { records as localRecords } from "@/lib/records-data";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return Response.json(localRecords);
  }

  const db = await getDb();
  const records = await db
    .collection("records")
    .find({})
    .sort({ _order: 1 })
    .toArray();

  return Response.json(
    records.map((r) => ({
      id: r.id,
      label: r.label,
      relay: r.relay,
      girls: r.girls,
      boys: r.boys,
    }))
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.MONGODB_URI) {
    return Response.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { id, gender, names, year, mark } = body as {
    id: string;
    gender: "girls" | "boys";
    names: string[];
    year: string;
    mark: string;
  };

  if (!id || !gender || !names || !year || !mark) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("records").updateOne(
    { id },
    { $set: { [gender]: { names, year, mark } } }
  );

  if (result.matchedCount === 0) {
    return Response.json({ error: "Record not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
