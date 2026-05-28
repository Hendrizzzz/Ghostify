import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ghostify | Keep Privacy Signals Local",
  description:
    "Ghostify is an open-source browser extension for local seen, typing, and story-view controls on Instagram, Messenger, and Facebook.",
  icons: {
    icon: [
      { url: "/ghostify-icon32.png", sizes: "32x32", type: "image/png" },
      { url: "/ghostify-icon128.png", sizes: "128x128", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Ghostify",
    description:
      "Local browser controls for seen, typing, and story-view signals on supported social platforms.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#090606",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
