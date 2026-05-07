import { useEffect, useRef, useState } from "react";
import { useOS, type TmuxPane } from "@/store/os";
import { runCommand } from "@/utils/commands";
import { Window } from "./Window";

export function Terminal() {
  const tmuxActive = useOS((s) => s.tmux.active);
  const terminal = useOS((s) => s.terminal);

  if (tmuxActive) return <TmuxTerminal />;
  return <PlainTerminal />;
}

function PlainTerminal() {
  const history = useOS((s) => s.history);
  const cwd = useOS((s) => s.cwd);
  const pushLine = useOS((s) => s.pushLine);
  const cmdHistory = useOS((s) => s.cmdHistory);
  const config = useOS((s) => s.config);
  const terminal = useOS((s) => s.terminal);
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (history.length === 0) {
      pushLine({ type: "sys", text: "omarchy jsh — type 'help' to begin" });
      pushLine({ type: "sys", text: "" });
    }
  }, [history.length, pushLine]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [history]);

  const submit = () => {
    runCommand(input, { push: (text, type = "out") => pushLine({ type, text }) });
    setInput("");
    setHistIdx(null);
  };

  const titles: Record<string, string> = {
    alacritty: "developer@omarchy: alacritty",
    ghostty: "developer@omarchy: ghostty",
    kitty: "developer@omarchy: kitty",
  };

  return (
    <Window
      appId="terminal"
      title={titles[terminal] || "developer@omarchy: jsh"}
      accent={`var(--neon-${config.accent})`}
    >
      <div
        className="h-full flex flex-col bg-[oklch(0.12_0.02_270)] cursor-text"
        onClick={() => inputRef.current?.focus()}
        style={{ fontSize: config.font }}
      >
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-0.5 leading-relaxed">
          {history.map((l) => (
            <div
              key={l.id}
              className={
                l.type === "in"
                  ? "text-foreground"
                  : l.type === "sys"
                    ? "text-neon-purple/80"
                    : "text-foreground/80 whitespace-pre"
              }
            >
              {l.text}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-neon-green text-glow-green">{cwd}</span>
            <span className="text-neon-purple">❯</span>
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  if (!cmdHistory.length) return;
                  const next = histIdx === null ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
                  setHistIdx(next);
                  setInput(cmdHistory[next] ?? "");
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (histIdx === null) return;
                  const next = histIdx + 1;
                  if (next >= cmdHistory.length) {
                    setHistIdx(null);
                    setInput("");
                  } else {
                    setHistIdx(next);
                    setInput(cmdHistory[next]);
                  }
                }
              }}
              aria-label="Terminal input"
              className="flex-1 bg-transparent outline-none text-foreground caret-neon-green"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </Window>
  );
}

function TmuxTerminal() {
  const sessions = useOS((s) => s.tmux.sessions);
  const activeSessionIdx = useOS((s) => s.tmux.activeSession);
  const prefixMode = useOS((s) => s.tmux.prefixMode);
  const copyMode = useOS((s) => s.tmux.copyMode);
  const config = useOS((s) => s.config);

  const session = sessions[activeSessionIdx];
  if (!session) return <PlainTerminal />;

  const window = session.windows[session.activeWindow];
  const pane = window.panes[window.activePane];

  return (
    <Window
      appId="terminal"
      title={`tmux: ${session.name} (${window.name})`}
      accent="var(--neon-purple)"
    >
      <div
        className="h-full flex flex-col bg-[oklch(0.12_0.02_270)]"
        style={{ fontSize: config.font }}
      >
        <div className={`grid h-full ${getGridClass(window.panes.length, window.layout)}`}>
          {window.panes.map((p, i) => (
            <TmuxPaneView key={p.id} pane={p} isActive={i === window.activePane} />
          ))}
        </div>
        <TmuxStatusBar
          session={session}
          activeWindow={session.activeWindow}
          prefixMode={prefixMode}
          copyMode={copyMode}
        />
      </div>
    </Window>
  );
}

function getGridClass(count: number, layout: string): string {
  if (layout === "single") return "grid-cols-1 grid-rows-1";
  if (layout === "main-horizontal")
    return count === 2 ? "grid-cols-1 grid-rows-2" : "grid-cols-1 grid-rows-3";
  if (layout === "main-vertical")
    return count === 2 ? "grid-cols-2 grid-rows-1" : "grid-cols-3 grid-rows-1";
  if (layout === "even-vertical") return "grid-cols-1 grid-rows-2";
  if (layout === "tiled") return count <= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-3 grid-rows-2";
  return "grid-cols-1 grid-rows-1";
}

function TmuxPaneView({ pane, isActive }: { pane: TmuxPane; isActive: boolean }) {
  const tmuxExecCommand = useOS((s) => s.tmuxExecCommand);
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [pane.lines]);

  const submit = () => {
    const trimmed = input.trim();
    if (trimmed) setCmdHistory((prev) => [...prev, trimmed]);
    tmuxExecCommand(input);
    setInput("");
    setHistIdx(null);
  };

  return (
    <div
      className={`relative border ${isActive ? "border-neon-purple" : "border-border/40"} overflow-hidden cursor-text`}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="absolute inset-0 p-2 overflow-y-auto space-y-0.5 leading-relaxed pb-4"
      >
        {pane.lines.map((l: any) => (
          <div
            key={l.id}
            className={
              l.type === "in"
                ? "text-foreground"
                : l.type === "sys"
                  ? "text-neon-purple/80"
                  : "text-foreground/80"
            }
          >
            {l.text}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span className="text-neon-green text-glow-green text-[11px]">{pane.cwd}</span>
          <span className="text-neon-purple text-[11px]">❯</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "ArrowUp") {
                e.preventDefault();
                if (!cmdHistory.length) return;
                const next = histIdx === null ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
                setHistIdx(next);
                setInput(cmdHistory[next] ?? "");
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                if (histIdx === null) return;
                const next = histIdx + 1;
                if (next >= cmdHistory.length) {
                  setHistIdx(null);
                  setInput("");
                } else {
                  setHistIdx(next);
                  setInput(cmdHistory[next]);
                }
              }
            }}
            aria-label="Terminal pane input"
            className="flex-1 bg-transparent outline-none text-foreground caret-neon-green text-[11px]"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}

function TmuxStatusBar({
  session,
  activeWindow,
  prefixMode,
  copyMode,
}: {
  session: any;
  activeWindow: number;
  prefixMode: boolean;
  copyMode: boolean;
}) {
  return (
    <div className="h-5 flex items-center px-2 bg-neon-purple/20 border-t border-neon-purple/40 text-[10px] gap-3 select-none">
      <span className="text-neon-purple font-bold">{session.name}</span>
      <div className="flex gap-1">
        {session.windows.map((w: any, i: number) => (
          <span
            key={w.name}
            className={`px-1 rounded ${i === activeWindow ? "bg-neon-purple/30 text-neon-purple" : "text-muted-foreground"}`}
          >
            {w.name}
            {w.name !== w.layout && w.panes.length > 1 ? "*" : ""}
          </span>
        ))}
      </div>
      <div className="flex-1" />
      {prefixMode && <span className="text-neon-green animate-pulse">prefix</span>}
      {copyMode && <span className="text-neon-blue animate-pulse">copy-mode</span>}
      <span className="text-muted-foreground">
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
