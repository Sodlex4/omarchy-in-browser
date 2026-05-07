import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";
import { useOS, type AppId } from "@/store/os";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function Window({
  appId,
  title,
  children,
  accent = "var(--neon-green)",
}: {
  appId: AppId;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const workspaces = useOS((s) => s.workspaces);
  const currentWs = useOS((s) => s.currentWs);
  const focusApp = useOS((s) => s.focusApp);
  const closeApp = useOS((s) => s.closeApp);
  const config = useOS((s) => s.config);
  const activeApp = workspaces[currentWs].activeApp;
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isActive = activeApp === appId;

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      {
        opacity: reducedMotion ? 1 : 0,
        scale: reducedMotion ? 1 : 0.96,
        y: reducedMotion ? 0 : 12,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: reducedMotion ? 0.01 : 0.3,
        ease: reducedMotion ? "none" : "power3.out",
      },
    );
  }, []);

  return (
    <div
      ref={ref}
      onMouseDown={() => focusApp(appId)}
      className="absolute inset-4 md:inset-8 flex flex-col window-shadow border bg-card overflow-hidden"
      style={{
        borderRadius: config.borderRadius,
        borderColor: isActive ? accent : "var(--border)",
        boxShadow: isActive
          ? `0 0 0 1px ${accent}, 0 0 40px color-mix(in oklab, ${accent} 25%, transparent), 0 30px 80px -20px oklch(0 0 0 / 0.6)`
          : undefined,
        opacity: config.opacity / 100,
        zIndex: isActive ? 20 : 10,
      }}
    >
      <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-surface/80">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        <button
          onClick={() => closeApp(appId)}
          aria-label="Close window"
          title="Close"
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
