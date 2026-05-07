import { useEffect, useState } from "react";
import { useOS } from "@/store/os";
import { useIsMobile } from "@/hooks/use-mobile";
import { Activity, Cpu, Wifi, Volume2 } from "lucide-react";

export function TopBar() {
  const workspaces = useOS((s) => s.workspaces);
  const currentWs = useOS((s) => s.currentWs);
  const focusApp = useOS((s) => s.focusApp);
  const toggleLauncher = useOS((s) => s.toggleLauncher);
  const config = useOS((s) => s.config);
  const layout = useOS((s) => s.layout);
  const gapsEnabled = useOS((s) => s.gapsEnabled);
  const tmuxActive = useOS((s) => s.tmux.active);
  const terminal = useOS((s) => s.terminal);
  const ws = workspaces[currentWs];
  const openApps = ws.openApps;
  const activeApp = ws.activeApp;
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const accentVar = `var(--neon-${config.accent})`;
  const isMobile = useIsMobile();

  return (
    <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-card/80 backdrop-blur-md text-xs select-none z-30 relative">
      <div className="flex items-center gap-1 min-w-0">
        <button
          onClick={toggleLauncher}
          className="px-2 py-1 rounded hover:bg-secondary flex items-center gap-2 shrink-0"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: accentVar, boxShadow: `0 0 8px ${accentVar}` }}
          />
          {!isMobile && <span className="font-bold tracking-wider">omarchy</span>}
        </button>
        <div className="ml-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {openApps.map((a) => (
            <button
              key={a}
              onClick={() => focusApp(a)}
              className={`px-2 py-1 rounded transition-colors shrink-0 ${activeApp === a ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground shrink-0">
        {!isMobile && (
          <>
            <span className="text-foreground">ws:{currentWs}</span>
            <span className="text-foreground">{layout}</span>
            {tmuxActive && <span className="text-neon-purple text-[10px]">tmux</span>}
            <span className="text-[10px] capitalize">{terminal}</span>
            {!gapsEnabled && <span className="text-destructive/60 text-[10px]">no-gaps</span>}
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3" /> 12%
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> 412M
            </span>
            <Wifi className="h-3 w-3" />
            <Volume2 className="h-3 w-3" />
          </>
        )}
        <span className="text-foreground tabular-nums">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
