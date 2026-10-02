export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className={`brand ${compact ? "brand-compact" : ""}`}>
    <svg className="brand-mark" width="48" height="58" viewBox="0 0 48 58" fill="none" aria-hidden="true">
      <path d="M24 3c-1 8-10 11-10 21 0 8 4 14 10 18 6-4 10-10 10-18C34 14 25 11 24 3Z" stroke="currentColor" strokeWidth="1.4"/><path d="M24 11v25M18 28h12M20 23h8M21 18h6M18 36l2-8h8l2 8M24 4C6 7 2 22 8 35l7 8M24 4c18 3 22 18 16 31l-7 8M6 40c9-1 15 3 18 10 3-7 9-11 18-10-1 9-8 14-18 14S7 49 6 40ZM24 54v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
    <span className="brand-name">KALASAM<span>TOURISM</span></span>
  </span>;
}
