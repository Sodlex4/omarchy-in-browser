import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { OMARCHY_BANNER } from "@/data/banner";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export function AnimatedBanner({ accent }: { accent: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  const registerChar = useCallback((el: HTMLSpanElement | null) => {
    if (el) charsRef.current.push(el);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => {
      charsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const chars = charsRef.current.filter(Boolean);
    const nonSpace = chars.filter((el) => el.textContent !== " ");

    if (reducedMotion || isMobile) {
      nonSpace.forEach((el) => {
        gsap.set(el, { opacity: 1, scale: 1 });
      });
      return;
    }

    let pulseCtx = gsap.context(() => {});
    let glitchTimeout: ReturnType<typeof setTimeout> | null = null;

    const revealTl = gsap.timeline({
      onComplete: () => {
        startPulse(nonSpace);
        scheduleGlitch(nonSpace);
      },
    });
    revealTl.fromTo(
      nonSpace,
      { opacity: 0, scale: 0.7 },
      {
        opacity: 1,
        scale: 1,
        stagger: { each: 0.003, from: "start" },
        duration: 0.06,
        ease: "power2.out",
      },
    );

    function startPulse(els: HTMLSpanElement[]) {
      if (!els.length) return;
      pulseCtx = gsap.context(() => {
        const tl = gsap.timeline({ repeat: -1 });
        els.forEach((el, i) => {
          const ratio = i / els.length;
          tl.to(
            el,
            {
              opacity: 0.55,
              textShadow: "0 0 4px currentColor",
              duration: 0.15,
            },
            ratio * 6,
          );
          tl.to(
            el,
            {
              opacity: 1,
              textShadow: "0 0 30px currentColor",
              duration: 0.15,
            },
            ratio * 6 + 6,
          );
        });
        tl.timeScale(1);
      }, containerRef);
    }

    function scheduleGlitch(els: HTMLSpanElement[]) {
      if (!els.length) return;
      const delay = 3000 + Math.random() * 5000;
      glitchTimeout = setTimeout(() => {
        const count = 3 + Math.floor(Math.random() * 4);
        const targets: HTMLSpanElement[] = [];
        const used = new Set<number>();
        for (let i = 0; i < count; i++) {
          let idx: number;
          do {
            idx = Math.floor(Math.random() * els.length);
          } while (used.has(idx));
          used.add(idx);
          targets.push(els[idx]);
        }
        gsap.to(targets, {
          x: () => (Math.random() - 0.5) * 4,
          y: () => (Math.random() - 0.5) * 2,
          opacity: 0.3,
          color: "var(--neon-pink)",
          duration: 0.06,
          ease: "steps(2)",
          onComplete: () => {
            gsap.to(targets, {
              x: 0,
              y: 0,
              opacity: 1,
              color: accent,
              duration: 0.15,
              ease: "power2.out",
            });
          },
        });
        scheduleGlitch(els);
      }, delay);
    }

    return () => {
      revealTl.kill();
      pulseCtx.revert();
      if (glitchTimeout) clearTimeout(glitchTimeout);
    };
  }, [accent, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="font-mono leading-[1.1] select-none"
      style={{ fontSize: "clamp(0.45rem, 1.1vw, 0.85rem)" }}
    >
      {OMARCHY_BANNER.map((line, li) => (
        <div key={li} className="whitespace-pre">
          {line.split("").map((char, ci) => (
            <span
              key={`${li}-${ci}`}
              ref={registerChar}
              className="inline-block"
              style={{ color: accent, textShadow: `0 0 30px ${accent}` }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
