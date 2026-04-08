type Props = {
  label: string;
  relay?: boolean;
};

const goldPlate: React.CSSProperties = {
  background: "#B99865",
  border: "1px solid #9a7d4e",
  borderRadius: "4px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
  color: "#21190c",
  fontFamily: "var(--font-cinzel-var), 'Times New Roman', serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column" as const,
  padding: "4px 4px",
  position: "relative" as const,
};

const dot: React.CSSProperties = {
  width: "var(--dot-size, 5px)",
  height: "var(--dot-size, 5px)",
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 35%, #d4c4a0, #7a6840)",
  border: "0.5px solid #8a7a50",
  position: "absolute",
};

export default function EventLabel({ label, relay }: Props) {
  // Split "Relay" onto its own line if present
  const hasRelay = label.toLowerCase().includes("relay");
  const mainLabel = hasRelay ? label.replace(/\s*Relay\s*/i, "").trim() : label;

  return (
    <div style={goldPlate}>
      {/* Dots: corners for relay, sides for non-relay */}
      {hasRelay ? (
        <>
          <span style={{ ...dot, top: "4px", left: "4px" }} />
          <span style={{ ...dot, top: "4px", right: "4px" }} />
          <span style={{ ...dot, bottom: "4px", left: "4px" }} />
          <span style={{ ...dot, bottom: "4px", right: "4px" }} />
        </>
      ) : (
        <>
          <span style={{ ...dot, top: "50%", left: "4px", transform: "translateY(-50%)" }} />
          <span style={{ ...dot, top: "50%", right: "4px", transform: "translateY(-50%)" }} />
        </>
      )}
      <span
        style={{
          fontSize: "var(--event-label-size, 0.8rem)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          lineHeight: 1.2,
          textAlign: "center",
          display: "inline-block",
          padding: "var(--event-label-padding, 0)",
        }}
      >
        {mainLabel}
      </span>
      {hasRelay && (
        <span
          style={{
            fontSize: "var(--event-label-size, 0.8rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          Relay
        </span>
      )}
    </div>
  );
}
