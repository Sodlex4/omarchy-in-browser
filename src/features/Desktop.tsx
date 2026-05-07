import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useOS, WORKSPACE_IDS, type WorkspaceId } from "@/store/os";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopBar } from "./TopBar";
import { Launcher } from "./Launcher";
import { Terminal } from "./Terminal";
import { Keybindings } from "./Keybindings";
import { ConfigLab } from "./ConfigLab";
import { InstallGuide } from "./InstallGuide";
import { TmuxCheatsheet } from "./TmuxCheatsheet";
import { AnimatedBanner } from "./AnimatedBanner";
import {
  Terminal as TermIcon,
  Keyboard,
  SlidersHorizontal,
  Download,
  Terminal as TmuxIcon,
} from "lucide-react";

const dock = [
  { id: "terminal" as const, icon: TermIcon, color: "var(--neon-green)" },
  { id: "keybindings" as const, icon: Keyboard, color: "var(--neon-blue)" },
  { id: "config" as const, icon: SlidersHorizontal, color: "var(--neon-purple)" },
  { id: "install" as const, icon: Download, color: "var(--neon-pink)" },
];

export function Desktop() {
  const workspaces = useOS((s) => s.workspaces);
  const currentWs = useOS((s) => s.currentWs);
  const lastWsDirection = useOS((s) => s.lastWsDirection);
  const openApp = useOS((s) => s.openApp);
  const toggleLauncher = useOS((s) => s.toggleLauncher);
  const switchWorkspace = useOS((s) => s.switchWorkspace);
  const config = useOS((s) => s.config);
  const accentVar = `var(--neon-${config.accent})`;
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const ws = workspaces[currentWs];
  const openApps = ws.openApps;

  const stageRef = useRef<HTMLDivElement>(null);
  const prevWsRef = useRef<WorkspaceId>(currentWs);

  useEffect(() => {
    if (prevWsRef.current === currentWs || !stageRef.current) {
      prevWsRef.current = currentWs;
      return;
    }
    const dir = lastWsDirection;
    const tl = gsap.timeline();
    tl.fromTo(
      stageRef.current,
      {
        x: dir * 60,
        opacity: reducedMotion ? 1 : 0,
        filter: reducedMotion ? "none" : "blur(12px)",
        scale: reducedMotion ? 1 : 0.98,
      },
      {
        x: 0,
        opacity: 1,
        filter: reducedMotion ? "none" : "blur(0px)",
        scale: 1,
        duration: reducedMotion ? 0.15 : 0.45,
        ease: reducedMotion ? "none" : "power3.out",
      },
    );
    prevWsRef.current = currentWs;
  }, [currentWs, lastWsDirection]);

  return (
    <div className="fixed inset-0 flex flex-col bg-hero">
      <TopBar />
      <div className="flex-1 relative bg-grid overflow-hidden">
        <div ref={stageRef} key={currentWs} className="absolute inset-0">
          {openApps.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none animate-float">
              <AnimatedBanner accent={accentVar} />
              <div className="mt-2 text-xs text-muted-foreground">
                workspace <span className="text-foreground">{currentWs}</span> · empty
              </div>
              {isMobile ? (
                <div className="mt-4 text-xs text-muted-foreground">
                  tap the launcher or dock icons below to open apps
                </div>
              ) : (
                <div className="mt-4 text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    Alt
                  </kbd>
                  +
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    1-5
                  </kbd>{" "}
                  switch ws ·
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    Super
                  </kbd>
                  +
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    Space/D
                  </kbd>{" "}
                  launcher ·
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    Super
                  </kbd>
                  +
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border mx-0.5">
                    ↵
                  </kbd>{" "}
                  terminal
                </div>
              )}
            </div>
          )}

          {openApps.includes("terminal") && <Terminal />}
          {openApps.includes("keybindings") && <Keybindings />}
          {openApps.includes("config") && <ConfigLab />}
          {openApps.includes("install") && <InstallGuide />}
          {openApps.includes("tmux-cheatsheet") && <TmuxCheatsheet />}
        </div>
      </div>

      {/* Dock */}
      {isMobile ? (
        <div className="fixed bottom-0 inset-x-0 z-30 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-1 bg-card/90 backdrop-blur-md border-t border-border">
            {WORKSPACE_IDS.map((id) => {
              const populated = workspaces[id].openApps.length > 0;
              const active = id === currentWs;
              return (
                <button
                  key={id}
                  onClick={() => switchWorkspace(id)}
                  aria-label={`Switch to workspace ${id}`}
                  className="h-11 w-11 rounded-lg text-sm font-bold border transition-all active:scale-90"
                  style={{
                    borderColor: active ? accentVar : "var(--border)",
                    color: active
                      ? accentVar
                      : populated
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    background: active
                      ? `color-mix(in oklab, ${accentVar} 18%, transparent)`
                      : populated
                        ? "var(--secondary)"
                        : "transparent",
                    boxShadow: active
                      ? `0 0 12px color-mix(in oklab, ${accentVar} 50%, transparent)`
                      : undefined,
                  }}
                  title={`workspace ${id}`}
                >
                  {id}
                </button>
              );
            })}
            <div className="w-px h-7 bg-border" />
            <button
              onClick={toggleLauncher}
              aria-label="Open application launcher"
              className="h-11 w-11 rounded-xl flex items-center justify-center border border-border active:scale-90"
              style={{ background: "color-mix(in oklab, var(--accent) 20%, transparent)" }}
              title="Launcher"
            >
              <span className="text-base font-bold" style={{ color: accentVar }}>
                ≡
              </span>
            </button>
            {dock.map((d) => {
              const Icon = d.icon;
              const open = openApps.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => openApp(d.id)}
                  aria-label={`Open ${d.id}`}
                  className="relative h-11 w-11 rounded-xl flex items-center justify-center border border-border active:scale-90"
                  style={{
                    color: d.color,
                    background: `color-mix(in oklab, ${d.color} 10%, transparent)`,
                    boxShadow: open
                      ? `0 0 14px color-mix(in oklab, ${d.color} 50%, transparent)`
                      : undefined,
                  }}
                  title={d.id}
                >
                  <Icon className="h-5 w-5" />
                  {open && (
                    <span
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full"
                      style={{ background: d.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          <div className="flex items-center gap-1 p-1.5 rounded-2xl border border-border bg-card/80 backdrop-blur-md window-shadow">
            {WORKSPACE_IDS.map((id) => {
              const populated = workspaces[id].openApps.length > 0;
              const active = id === currentWs;
              return (
                <button
                  key={id}
                  onClick={() => switchWorkspace(id)}
                  aria-label={`Switch to workspace ${id}`}
                  className="h-7 w-7 rounded-md text-[11px] font-bold border transition-all hover:scale-110 cursor-pointer"
                  style={{
                    borderColor: active ? accentVar : "var(--border)",
                    color: active
                      ? accentVar
                      : populated
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    background: active
                      ? `color-mix(in oklab, ${accentVar} 18%, transparent)`
                      : populated
                        ? "var(--secondary)"
                        : "transparent",
                    boxShadow: active
                      ? `0 0 12px color-mix(in oklab, ${accentVar} 50%, transparent)`
                      : undefined,
                  }}
                  title={`workspace ${id}`}
                >
                  {id}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border bg-card/80 backdrop-blur-md window-shadow">
            <button
              onClick={toggleLauncher}
              aria-label="Open application launcher"
              className="h-10 w-10 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 transition-all"
              style={{ background: "color-mix(in oklab, var(--accent) 20%, transparent)" }}
              title="Launcher (Super+Space or Alt+D)"
            >
              <span className="text-xs font-bold" style={{ color: accentVar }}>
                ≡
              </span>
            </button>
            <div className="w-px h-6 bg-border" />
            {dock.map((d) => {
              const Icon = d.icon;
              const open = openApps.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => openApp(d.id)}
                  aria-label={`Open ${d.id}`}
                  className="relative h-10 w-10 rounded-xl flex items-center justify-center border border-border hover:border-foreground/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  style={{
                    color: d.color,
                    background: `color-mix(in oklab, ${d.color} 10%, transparent)`,
                    boxShadow: open
                      ? `0 0 14px color-mix(in oklab, ${d.color} 50%, transparent)`
                      : undefined,
                  }}
                  title={d.id}
                >
                  <Icon className="h-4 w-4" />
                  {open && (
                    <span
                      className="absolute -bottom-1 h-1 w-1 rounded-full"
                      style={{ background: d.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Launcher />
    </div>
  );
}
