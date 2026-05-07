import { useState } from "react";
import { useOS } from "@/store/os";
import { useIsMobile } from "@/hooks/use-mobile";
import { Window } from "./Window";
import { Eye, EyeOff } from "lucide-react";

const accents: Array<{ id: "green" | "purple" | "blue" | "pink"; label: string }> = [
  { id: "green", label: "Matrix" },
  { id: "purple", label: "Neon" },
  { id: "blue", label: "Tokyo" },
  { id: "pink", label: "Synth" },
];

export function ConfigLab() {
  const config = useOS((s) => s.config);
  const setConfig = useOS((s) => s.setConfig);
  const accent = `var(--neon-${config.accent})`;
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Window appId="config" title="~/.config/omarchy.toml" accent="var(--neon-purple)">
      <div className={`h-full ${isMobile ? "flex flex-col" : "grid md:grid-cols-2"} bg-[oklch(0.14_0.02_270)]`}>
        <div className={`${isMobile ? "flex-1 overflow-y-auto" : ""} p-6 border-r border-border overflow-y-auto space-y-6`}>
          <div>
            <h2 className="text-xl text-glow-purple text-neon-purple">Config Lab</h2>
            <p className="text-xs text-muted-foreground mt-1">Live tweak your environment.</p>
          </div>

          <Slider
            label="border-radius"
            value={config.borderRadius}
            min={0}
            max={32}
            onChange={(v) => setConfig({ borderRadius: v })}
            suffix="px"
          />
          <Slider
            label="gaps"
            value={config.gap}
            min={0}
            max={48}
            onChange={(v) => setConfig({ gap: v })}
            suffix="px"
          />
          <Slider
            label="window-opacity"
            value={config.opacity}
            min={50}
            max={100}
            onChange={(v) => setConfig({ opacity: v })}
            suffix="%"
          />
          <Slider
            label="font-size"
            value={config.font}
            min={10}
            max={20}
            onChange={(v) => setConfig({ font: v })}
            suffix="px"
          />

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">accent</span>
              <span style={{ color: accent }}>{config.accent}</span>
            </div>
            <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Accent color">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setConfig({ accent: a.id })}
                  role="radio"
                  aria-checked={config.accent === a.id}
                  className="px-2 py-2 rounded-md border text-xs transition-all"
                  style={{
                    borderColor: config.accent === a.id ? `var(--neon-${a.id})` : "var(--border)",
                    background: `color-mix(in oklab, var(--neon-${a.id}) 14%, transparent)`,
                    color: `var(--neon-${a.id})`,
                    boxShadow:
                      config.accent === a.id
                        ? `0 0 16px color-mix(in oklab, var(--neon-${a.id}) 50%, transparent)`
                        : undefined,
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-center gap-2 py-2 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showPreview ? "hide preview" : "show preview"}
          </button>
        )}
        {(showPreview || !isMobile) && (
        <div className={`${isMobile ? "" : ""} p-6 overflow-y-auto bg-[oklch(0.10_0.02_270)]`}>
          <div className="text-[11px] text-muted-foreground mb-2">~/.config/omarchy.toml</div>
          <pre className="text-xs leading-relaxed">
            {`[appearance]
border_radius = ${config.borderRadius}
gap          = ${config.gap}
opacity      = ${(config.opacity / 100).toFixed(2)}
font_size    = ${config.font}
accent       = "${config.accent}"

[wm]
layout       = "tiling"
animations   = true
blur         = true
`}
          </pre>

          <div className="mt-6 grid grid-cols-3 gap-3" style={{ gap: config.gap }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video border bg-card flex items-center justify-center text-xs text-muted-foreground"
                style={{
                  borderRadius: config.borderRadius,
                  borderColor: accent,
                  boxShadow: `0 0 12px color-mix(in oklab, ${accent} 25%, transparent)`,
                  opacity: config.opacity / 100,
                }}
              >
                tile_{i}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </Window>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label}: ${value}${suffix}`}
        className="w-full accent-[var(--neon-purple)]"
      />
    </div>
  );
}
