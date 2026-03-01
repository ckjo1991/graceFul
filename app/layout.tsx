import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GraceFul",
  description: "Anonymous prayer wall for gratitude, struggle, and safe support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="text-[var(--foreground)]"
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
