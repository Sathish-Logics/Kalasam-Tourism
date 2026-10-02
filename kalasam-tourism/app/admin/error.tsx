"use client";

import Link from "next/link";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main id="admin-content" className="admin-main"><section className="admin-card"><h1>We couldn’t open this workspace.</h1><p>Your session may have expired, or the database is temporarily unavailable. Sign in with an invited staff account, or try again.</p><div className="admin-row"><button className="admin-button" onClick={reset}>Try again</button><Link className="admin-button secondary" href="/admin/login">Go to sign in</Link></div></section></main>;
}
