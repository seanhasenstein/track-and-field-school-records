import { RecordEntry } from "@/lib/types";

type Props = {
  entry: RecordEntry;
  relay: boolean;
};

const nameplate: React.CSSProperties = {
  background: "#fbf8f5",
  border: "1px solid #d4c4b0",
  borderRadius: "4px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
  color: "#000000",
  fontFamily: "var(--font-cinzel-var), 'Times New Roman', serif",
  position: "relative",
};

const dot: React.CSSProperties = {
  width: "var(--dot-size, 5px)",
  height: "var(--dot-size, 5px)",
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 35%, #c0c0c0, #666)",
  border: "0.5px solid #999",
  position: "absolute",
};

export default function RecordPlaque({ entry, relay }: Props) {
  if (relay) {
    return (
      <div style={{ ...nameplate, padding: "var(--relay-plaque-padding, 5px 12px)" }}>
        {/* Corner dots */}
        <span style={{ ...dot, top: "4px", left: "4px" }} />
        <span style={{ ...dot, top: "4px", right: "4px" }} />
        <span style={{ ...dot, bottom: "4px", left: "4px" }} />
        <span style={{ ...dot, bottom: "4px", right: "4px" }} />

        <div style={{ textAlign: "center" }}>
          {entry.names.map((name, i) => (
            <div
              key={i}
              style={{
                fontSize: "var(--relay-name-size, 0.8rem)",
                fontWeight: 700,
                lineHeight: "1.35",
                textTransform: "uppercase",
                letterSpacing: "0.01em",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginTop: "3px", padding: "var(--detail-padding, 0 20%)" }}>
          <span style={{ fontSize: "var(--record-detail-size, 0.8rem)", fontWeight: 600 }}>{entry.year}</span>
          <span style={{ fontSize: "var(--record-detail-size, 0.8rem)", fontWeight: 600 }}>{entry.mark}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...nameplate, padding: "var(--plaque-padding, 4px 12px)", textAlign: "center" }}>
      {/* Side dots */}
      <span style={{ ...dot, top: "50%", left: "4px", transform: "translateY(-50%)" }} />
      <span style={{ ...dot, top: "50%", right: "4px", transform: "translateY(-50%)" }} />

      <div
        style={{
          fontSize: "var(--record-name-size, 0.85rem)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.01em",
        }}
      >
        {entry.names[0]}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1px", padding: "var(--detail-padding, 0 20%)" }}>
        <span style={{ fontSize: "var(--record-detail-size, 0.8rem)", fontWeight: 600 }}>{entry.year}</span>
        <span style={{ fontSize: "var(--record-detail-size, 0.8rem)", fontWeight: 600 }}>{entry.mark}</span>
      </div>
    </div>
  );
}
