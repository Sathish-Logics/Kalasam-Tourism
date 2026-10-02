import type { Metadata } from "next";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Staff dashboard | Kalasam Tourism",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell"><a className="admin-skip" href="#admin-content">Skip to dashboard content</a>{children}</div>;
}
