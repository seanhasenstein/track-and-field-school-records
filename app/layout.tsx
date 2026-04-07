import type { Metadata } from "next";
import { Cinzel, Lato } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel-var",
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato-var",
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
    <html lang="en" className={`${cinzel.variable} ${lato.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
