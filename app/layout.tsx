import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel-var",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sheboygan Lutheran Track & Field Records",
  description:
    "Official track and field record board for Sheboygan Lutheran High School",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
