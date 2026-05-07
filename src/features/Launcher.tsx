import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useOS } from "@/store/os";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  Terminal as TermIcon,
  Keyboard,
  SlidersHorizontal,
  Download,
  Terminal as TmuxIcon,
} from "lucide-react";

const apps: {
  id: "terminal" | "keybindings" | "config" | "install" | "tmux-cheatsheet";
  name: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  {
    id: "terminal",
    name: "Terminal",
    desc: "jsh shell",
    icon: TermIcon,
    color: "var(--neon-green)",
  },
  {
    id: "keybindings",
    name: "Keybindings",
    desc: "Visualizer",
    icon: Keyboard,
    color: "var(--neon-blue)",
  },
  {
    id: "config",
    name: "Config Lab",
    desc: "~/.config",
    icon: SlidersHorizontal,
    color: "var(--neon-purple)",
  },
  {
    id: "install",
    name: "Install Guide",
    desc: "Bootstrap",
    icon: Download,
    color: "var(--neon-pink)",
  },
  {
    id: "tmux-cheatsheet",
    name: "Tmux Cheatsheet",
    desc: "Prefix key bindings",
    icon: TmuxIcon,
    color: "var(--neon-green)",
  },
];

export function Launcher() {
  const launcherOpen = useOS((s) => s.launcherOpen);
  const toggleLauncher = useOS((s) => s.toggleLauncher);
  const openApp = useOS((s) => s.openApp);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  const filtered = apps.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (!launcherOpen) return;
    setQ("");
    setIdx(0);
    idxRef.current = 0;
    requestAnimationFrame(() => inputRef.current?.focus());
    gsap.fromTo(
      ref.current,
      {
        opacity: reducedMotion ? 1 : 0,
        y: reducedMotion ? 0 : -10,
        scale: reducedMotion ? 1 : 0.96,
        filter: reducedMotion ? "none" : "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "none",
        duration: reducedMotion ? 0.01 : 0.25,
        ease: reducedMotion ? "none" : "power3.out",
      },
    );
  }, [launcherOpen]);

  useEffect(() => {
    if (!launcherOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleLauncher();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const n = Math.min(filtered.length - 1, idxRef.current + 1);
        setIdx(n);
        idxRef.current = n;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const n = Math.max(0, idxRef.current - 1);
        setIdx(n);
        idxRef.current = n;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const a = filtered[idxRef.current];
        if (a) openApp(a.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launcherOpen, filtered, openApp, toggleLauncher]);

  if (!launcherOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center pt-24 px-4"
      onClick={toggleLauncher}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-card/95 border border-border rounded-xl window-shadow overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <span className="text-neon-purple text-glow-purple">❯</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            placeholder="Search applications..."
            aria-label="Search applications"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
            esc
          </kbd>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
          {filtered.map((a, i) => {
            const Icon = a.icon;
            const active = i === idx;
            return (
              <button
                key={a.id}
                onMouseEnter={() => setIdx(i)}
                onClick={() => openApp(a.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg text-left transition-all ${active ? "bg-secondary" : ""}`}
              >
                <div
                  className="h-10 w-10 rounded-md flex items-center justify-center border border-border"
                  style={{
                    background: `color-mix(in oklab, ${a.color} 12%, transparent)`,
                    color: a.color,
                    boxShadow: active
                      ? `0 0 16px color-mix(in oklab, ${a.color} 50%, transparent)`
                      : undefined,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.desc}</div>
                </div>
                {active && <span className="text-xs text-muted-foreground">↵</span>}
              </button>
            );
          })}
          {!filtered.length && (
            <div className="text-center text-sm text-muted-foreground py-8">no results</div>
          )}
        </div>
      </div>
    </div>
  );
}
