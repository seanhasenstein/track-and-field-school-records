import Image from "next/image";
import RecordBoard from "@/components/RecordBoard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="board-page" style={{ background: "#0A2C23", minHeight: "100vh", padding: "40px 16px" }}>
      {/* Title — gold text on green, no background */}
      <header style={{ textAlign: "center", marginBottom: "24px" }}>
        <Image
          src="/shield-with-background.svg"
          alt="Sheboygan Lutheran shield"
          width={42}
          height={54}
          style={{ margin: "0 auto 10px", width: "clamp(36px, 5vw, 42px)", height: "auto" }}
          priority
        />
        <h1
          style={{
            fontFamily: "var(--font-cinzel-var), 'Times New Roman', serif",
            color: "#BE945D",
            fontSize: "clamp(1.4rem, 3.5vw, 2.4rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.3,
            margin: 0,
          }}
        >
          Sheboygan Lutheran
          <br />
          High School
        </h1>
        <h2
          style={{
            fontFamily: "var(--font-cinzel-var), 'Times New Roman', serif",
            color: "#BE945D",
            fontSize: "clamp(1.1rem, 2.8vw, 1.9rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            lineHeight: 1.3,
            margin: "4px 0 0 0",
          }}
        >
          Track & Field Records
        </h2>
      </header>

      <main>
        <RecordBoard />
      </main>

      <footer className="no-print" style={{ textAlign: "center", marginTop: "32px" }}>
        <Link
          href="/admin"
          style={{ color: "rgba(160,140,60,0.18)", fontSize: "0.6rem", fontFamily: "var(--font-cinzel-var), serif" }}
        >
          Admin
        </Link>
      </footer>
    </div>
  );
}
