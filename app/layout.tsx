import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GraceFul",
  description: "Anonymous prayer wall for gratitude, struggle, and safe support.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
