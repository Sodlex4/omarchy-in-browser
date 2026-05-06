import { useEffect, useState } from "react";
import { useOS } from "@/store/os";
import { Activity, Cpu, Wifi, Volume2 } from "lucide-react";

export function TopBar() {
  const { openApps, activeApp, focusApp, toggleLauncher, config } = useOS();
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const accentVar = `var(--neon-${config.accent})`;

  return (
    <div className="h-9 flex items-center justify-between px-3 border-b border-border bg-card/80 backdrop-blur-md text-xs select-none z-30 relative">
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLauncher}
          className="px-2 py-1 rounded hover:bg-secondary flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full" style={{ background: accentVar, boxShadow: `0 0 8px ${accentVar}` }} />
          <span className="font-bold tracking-wider">myomarchy</span>
        </button>
        <div className="ml-2 flex items-center gap-1">
          {openApps.map((a) => (
            <button
              key={a}
              onClick={() => focusApp(a)}
              className={`px-2 py-1 rounded transition-colors ${activeApp === a ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="flex items-center gap-1.5"><Cpu className="h-3 w-3" /> 12%</span>
        <span className="flex items-center gap-1.5"><Activity className="h-3 w-3" /> 412M</span>
        <Wifi className="h-3 w-3" />
        <Volume2 className="h-3 w-3" />
        <span className="text-foreground tabular-nums">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
