import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Check, Terminal } from "lucide-react";
import { useOS } from "@/store/os";
import { Window } from "./Window";

const terminals = [
  { id: "alacritty" as const, name: "Alacritty", desc: "Fast, minimal, no native tabs/splits" },
  { id: "ghostty" as const, name: "Ghostty", desc: "Native tabs, splits, GPU accelerated" },
  { id: "kitty" as const, name: "Kitty", desc: "Tabs, splits, image rendering support" },
];

const steps = [
  {
    name: "Select terminal",
    logs: ["alacritty (default)", "ghostty (recommended)", "kitty (feature-rich)"],
  },
  {
    name: "Downloading base image",
    logs: ["fetch arch-base.iso", "verify sha256 ✓", "150MB cached"],
  },
  { name: "Partitioning disk", logs: ["mkpart /boot 512M", "mkpart / 100%", "format btrfs"] },
  {
    name: "Installing packages",
    logs: ["pacstrap base linux", "+ hyprland waybar", "+ neovim git zsh"],
  },
  {
    name: "Applying dotfiles",
    logs: ["clone omarchy/dotfiles", "stow -t ~", "theme: tokyo-night"],
  },
  { name: "Finalizing", logs: ["enable services", "rebuild initramfs", "ready to boot"] },
];

export function InstallGuide() {
  const terminal = useOS((s) => s.terminal);
  const setTerminal = useOS((s) => s.setTerminal);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const barRef = useRef<HTMLDivElement>(null);

  const selectTerminal = (t: "alacritty" | "ghostty" | "kitty") => {
    setTerminal(t);
    setLogs((prev) => [...prev, `[terminal] selected: ${t}`]);
    setTimeout(() => {
      setStep(1);
      setRunning(true);
      setLogs((prev) => [...prev, `[init] starting installer...`]);
    }, 600);
  };

  useEffect(() => {
    if (!running || step === 0) return;
    let p = progress;
    const interval = setInterval(() => {
      p += 2 + Math.random() * 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        if (step < steps.length - 1) {
          setTimeout(() => {
            setStep((s) => s + 1);
            setProgress(0);
          }, 500);
        } else {
          setDone(true);
          setRunning(false);
        }
      }
      setProgress(p);
    }, 120);
    return () => clearInterval(interval);
  }, [running, step]);

  useEffect(() => {
    if (!running || step === 0) return;
    const s = steps[step];
    let i = 0;
    const t = setInterval(() => {
      if (i >= s.logs.length) {
        clearInterval(t);
        return;
      }
      setLogs((prev) => [...prev, `[step ${step + 1}] ${s.logs[i]}`]);
      i++;
    }, 350);
    return () => clearInterval(t);
  }, [step, running]);

  useEffect(() => {
    gsap.to(barRef.current, { width: `${progress}%`, duration: 0.4, ease: "power2.out" });
  }, [progress]);

  const start = () => {
    setRunning(true);
    setLogs([`[init] starting installer...`]);
  };

  return (
    <Window appId="install" title="omarchy-installer" accent="var(--neon-pink)">
      <div className="h-full flex flex-col bg-[oklch(0.13_0.02_270)] p-6 overflow-y-auto">
        <h2 className="text-xl text-neon-pink" style={{ textShadow: "0 0 12px var(--neon-pink)" }}>
          Install Omarchy
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Simulated installer — no real disks were harmed.
        </p>

        {step === 0 && !running && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4" /> Select Terminal
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {terminals.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTerminal(t.id)}
                  className="p-3 rounded-lg border text-left transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: terminal === t.id ? "var(--neon-green)" : "var(--border)",
                    background:
                      terminal === t.id
                        ? "color-mix(in oklab, var(--neon-green) 10%, transparent)"
                        : "var(--card)/50",
                    boxShadow:
                      terminal === t.id
                        ? "0 0 16px color-mix(in oklab, var(--neon-green) 40%, transparent)"
                        : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-md flex items-center justify-center border border-border"
                      style={{ color: "var(--neon-green)" }}
                    >
                      <Terminal className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.desc}</div>
                    </div>
                    {terminal === t.id && <Check className="h-4 w-4 text-neon-green ml-auto" />}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Or run{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-secondary border border-border">
                tmux
              </kbd>{" "}
              in terminal for multiplexing.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {steps.slice(1).map((s, i) => {
            const actualIdx = i + 1;
            const completed = actualIdx < step || done;
            const current = actualIdx === step && running && !done;
            return (
              <div
                key={s.name}
                className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50 transition-all"
                style={{
                  borderColor: current
                    ? "var(--neon-pink)"
                    : completed
                      ? "var(--neon-green)"
                      : undefined,
                  opacity: completed || current ? 1 : 0.55,
                }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs border"
                  style={{
                    borderColor: completed
                      ? "var(--neon-green)"
                      : current
                        ? "var(--neon-pink)"
                        : "var(--border)",
                    color: completed
                      ? "var(--neon-green)"
                      : current
                        ? "var(--neon-pink)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-sm flex-1">{s.name}</span>
                {current && (
                  <span className="text-xs text-neon-pink animate-pulse">running...</span>
                )}
              </div>
            );
          })}
        </div>

        {running && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>
                step {Math.min(step, steps.length - 1)} / {steps.length - 1}
              </span>
              <span className="tabular-nums">{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                ref={barRef}
                className="h-full"
                style={{
                  background: "linear-gradient(90deg, var(--neon-pink), var(--neon-purple))",
                  boxShadow: "0 0 12px var(--neon-pink)",
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex-1 min-h-32 rounded-md border border-border bg-[oklch(0.10_0.02_270)] p-3 overflow-y-auto text-xs">
          {logs.length === 0 && <div className="text-muted-foreground">awaiting input...</div>}
          {logs.map((l, i) => (
            <div key={i} className="text-foreground/80">
              {l}
            </div>
          ))}
          {done && (
            <div className="text-neon-green text-glow-green mt-2">
              ✓ install complete. reboot to enter omarchy.
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            disabled={running}
            onClick={() => {
              if (done) {
                setStep(0);
                setProgress(0);
                setLogs([]);
                setDone(false);
              } else {
                start();
              }
            }}
            className="px-4 py-2 rounded-md font-bold text-sm border transition-all disabled:opacity-50"
            style={{
              borderColor: "var(--neon-pink)",
              color: "var(--neon-pink)",
              background: "color-mix(in oklab, var(--neon-pink) 12%, transparent)",
              boxShadow: "0 0 16px color-mix(in oklab, var(--neon-pink) 40%, transparent)",
            }}
          >
            {done ? "↻ run again" : running ? "installing..." : "▶ start install"}
          </button>
        </div>
      </div>
    </Window>
  );
}
