import { EventRecord } from "@/lib/types";
import { records as localRecords } from "@/lib/records-data";
import RecordPlaque from "./RecordPlaque";
import EventLabel from "./EventLabel";

const gridCols = "1fr 140px 1fr";
const gridGap = "20px";
const rowGap = "12px";

const headerText: React.CSSProperties = {
  fontFamily: "var(--font-cinzel-var), 'Times New Roman', serif",
  color: "#000000",
  fontSize: "var(--header-font-size, 1.25rem)",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  textAlign: "center",
  padding: "0 0 4px 0",
};

async function getRecords(): Promise<EventRecord[]> {
  if (!process.env.MONGODB_URI) {
    return localRecords;
  }

  try {
    const { getDb } = await import("@/lib/mongodb");
    const db = await getDb();
    const records = await db
      .collection("records")
      .find({})
      .sort({ _order: 1 })
      .toArray();

    return records.map((r) => ({
      id: r.id as string,
      label: r.label as string,
      relay: r.relay as boolean,
      girls: r.girls as EventRecord["girls"],
      boys: r.boys as EventRecord["boys"],
    }));
  } catch {
    return localRecords;
  }
}

export default async function RecordBoard() {
  const records = await getRecords();

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px" }}>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: gridGap, marginBottom: "8px" }}>
        <div style={headerText}>Girls Records</div>
        <div style={headerText}>Event</div>
        <div style={headerText}>Boys Records</div>
      </div>

      {/* Record rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: rowGap }}>
        {records.map((event) => (
          <div
            key={event.id}
            style={{ display: "grid", gridTemplateColumns: gridCols, gap: gridGap, alignItems: "stretch" }}
          >
            <RecordPlaque entry={event.girls} relay={event.relay} />
            <EventLabel label={event.label} />
            <RecordPlaque entry={event.boys} relay={event.relay} />
          </div>
        ))}
      </div>
    </div>
  );
}
