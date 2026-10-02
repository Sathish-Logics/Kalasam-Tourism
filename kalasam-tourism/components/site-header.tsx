"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";

const links = [["Home", "/"], ["Journeys", "/journeys"], ["Destinations", "/destinations"], ["Temple Circuits", "/temple-circuits"], ["Family Ceremonies", "/family-ceremonies"], ["Senior Assistance", "/senior-assistance"], ["B2B Partners", "/b2b-partners"]];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [open]);
  return <header className="site-header">
    <div className="header-inner">
      <Link href="/" aria-label="Kalasam Tourism home" onClick={() => setOpen(false)}><Brand /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([name, href]) => <Link key={href} href={href} className={path === href || href !== "/" && path.startsWith(href) ? "active" : ""} aria-current={path === href ? "page" : undefined}>{name}</Link>)}</nav>
      <Link className="header-contact" href="/contact">Let’s connect <ArrowUpRight size={15} /></Link>
      <button ref={toggle} className="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">{links.map(([name, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined}>{name}<ArrowUpRight size={16} /></Link>)}<Link href="/contact" onClick={() => setOpen(false)}>Contact</Link><Link href="/plan-my-journey" className="button button-gold" onClick={() => setOpen(false)}>Plan my journey</Link></nav>}
  </header>;
}
