import type { Metadata, Viewport } from "next";
import { siteIndexable, siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Kalasam Tourism | Sacred journeys of South India", template: "%s | Kalasam Tourism" },
  description: "Discover South India's temple heritage, spiritual journeys, and family traditions. Plan your personal journey with Kalasam Tourism.",
  robots: { index: siteIndexable, follow: true },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#211c16", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
