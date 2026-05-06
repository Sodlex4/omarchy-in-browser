import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useOS } from "@/store/os";

const lines = [
  "[ OK ] booting omarchy v1.0.0...",
  "[ OK ] mounting /dev/lovable",
  "[ OK ] loading kernel modules: hyprland, waybar, alacritty",
  "[ OK ] initializing tiling compositor",
  "[ OK ] starting jsh shell",
  "[ OK ] applying theme: tokyo-night",
  "",
  "welcome, developer.",
  "press any key to continue (or wait 8s)_",
];

export function Boot() {
  const setBooted = useOS((s) => s.setBooted);
  const setPressed = useOS((s) => s.setPressed);
  const [shown, setShown] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < lines.length) {
        setShown((s) => [...s, lines[i]]);
      }
      i++;
      if (i >= lines.length) clearInterval(t);
    }, 220);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (shown.length < lines.length) return;
    autoTimerRef.current = setTimeout(() => triggerBoot(), 8000);
    const onKey = () => triggerBoot();
    window.addEventListener("keydown", onKey, { once: true });
    window.addEventListener("click", onKey, { once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onKey);
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [shown]);

  const triggerBoot = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setPressed([]);
    gsap.to(ref.current, {
      opacity: 0,
      scale: 1.05,
      filter: "blur(20px)",
      duration: 0.6,
      ease: "power2.in",
      onComplete: () => setBooted(true),
    });
  };

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background scanline overflow-hidden"
    >
      <div className="absolute inset-0 bg-hero opacity-60" />
      <div className="relative max-w-2xl w-full px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-neon-green shadow-[0_0_12px_var(--neon-green)]" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            omarchy boot
          </span>
        </div>
        <pre className="text-sm leading-relaxed text-foreground/90">
          {shown.map((l, i) => {
            if (typeof l !== "string") return null;
            const isOk = l.startsWith("[ OK ]");
            const isWelcome = l.includes("welcome");
            const isPrompt = l.includes("press any");
            return (
              <div
                key={i}
                className={
                  isWelcome
                    ? "text-neon-green text-glow-green text-xl mt-4"
                    : isPrompt
                      ? "text-neon-purple text-glow-purple animate-pulse"
                      : ""
                }
              >
                {isOk ? <span className="text-neon-green">[ OK ]</span> : null}
                {isOk ? l.slice(6) : l}
              </div>
            );
          })}
          {shown.length < lines.length && <span className="caret" />}
        </pre>
      </div>
    </div>
  );
}
