import type { ReactNode } from "react";
import { useLocation } from "react-router";

/** Re-mounts children on route change with a short fade-in. */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div
      key={pathname}
      className="min-h-screen opacity-0-start animate-fade-in"
    >
      {children}
    </div>
  );
}
