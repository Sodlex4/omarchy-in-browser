import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Check } from "lucide-react";
import { Window } from "./Window";

const steps = [
  { name: "Downloading base image", logs: ["fetch arch-base.iso", "verify sha256 ✓", "150MB cached"] },
  { name: "Partitioning disk", logs: ["mkpart /boot 512M", "mkpart / 100%", "format btrfs"] },
  { name: "Installing packages", logs: ["pacstrap base linux", "+ hyprland waybar alacritty", "+ neovim git zsh"] },
  { name: "Applying dotfiles", logs: ["clone omarchy/dotfiles", "stow -t ~", "theme: tokyo-night"] },
  { name: "Finalizing", logs: ["enable services", "rebuild initramfs", "ready to boot"] },
];

export function InstallGuide() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    let p = progress;
    const interval = setInterval(() => {
      p += 2 + Math.random() * 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        if (step < steps.length - 1) {
          setTimeout(() => { setStep((s) => s + 1); setProgress(0); }, 500);
        } else {
          setDone(true); setRunning(false);
        }
      }
      setProgress(p);
    }, 120);
    return () => clearInterval(interval);
  }, [running, step]);

  useEffect(() => {
    if (!running) return;
    const s = steps[step];
    let i = 0;
    const t = setInterval(() => {
      if (i >= s.logs.length) { clearInterval(t); return; }
      setLogs((prev) => [...prev, `[step ${step + 1}] ${s.logs[i]}`]);
      i++;
    }, 350);
    return () => clearInterval(t);
  }, [step, running]);

  useEffect(() => {
    gsap.to(barRef.current, { width: `${progress}%`, duration: 0.4, ease: "power2.out" });
  }, [progress]);

  const start = () => { setRunning(true); setLogs([`[init] starting installer...`]); };

  return (
    <Window appId="install" title="omarchy-installer" accent="var(--neon-pink)">
      <div className="h-full flex flex-col bg-[oklch(0.13_0.02_270)] p-6 overflow-y-auto">
        <h2 className="text-xl text-neon-pink" style={{ textShadow: "0 0 12px var(--neon-pink)" }}>Install MyOmarchy</h2>
        <p className="text-xs text-muted-foreground mt-1">Simulated installer — no real disks were harmed.</p>

        <div className="mt-6 space-y-2">
          {steps.map((s, i) => {
            const completed = i < step || done;
            const current = i === step && running && !done;
            return (
              <div
                key={s.name}
                className="flex items-center gap-3 p-3 rounded-md border border-border bg-card/50 transition-all"
                style={{
                  borderColor: current ? "var(--neon-pink)" : completed ? "var(--neon-green)" : undefined,
                  opacity: completed || current ? 1 : 0.55,
                }}
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-xs border"
                  style={{
                    borderColor: completed ? "var(--neon-green)" : current ? "var(--neon-pink)" : "var(--border)",
                    color: completed ? "var(--neon-green)" : current ? "var(--neon-pink)" : "var(--muted-foreground)",
                  }}
                >
                  {completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-sm flex-1">{s.name}</span>
                {current && <span className="text-xs text-neon-pink animate-pulse">running...</span>}
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>step {Math.min(step + 1, steps.length)} / {steps.length}</span>
            <span className="tabular-nums">{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              ref={barRef}
              className="h-full"
              style={{ background: "linear-gradient(90deg, var(--neon-pink), var(--neon-purple))", boxShadow: "0 0 12px var(--neon-pink)" }}
            />
          </div>
        </div>

        <div className="mt-6 flex-1 min-h-32 rounded-md border border-border bg-[oklch(0.10_0.02_270)] p-3 overflow-y-auto text-xs">
          {logs.length === 0 && <div className="text-muted-foreground">awaiting input...</div>}
          {logs.map((l, i) => (
            <div key={i} className="text-foreground/80">{l}</div>
          ))}
          {done && <div className="text-neon-green text-glow-green mt-2">✓ install complete. reboot to enter myomarchy.</div>}
        </div>

        <div className="mt-4">
          <button
            disabled={running}
            onClick={() => { if (done) { setStep(0); setProgress(0); setLogs([]); setDone(false); } else { start(); } }}
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
