import { useEffect, useRef, useState } from "react";
import { useOS } from "@/store/os";
import { runCommand } from "@/utils/commands";
import { Window } from "./Window";

export function Terminal() {
  const { history, cwd, pushLine, cmdHistory, config } = useOS();
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (history.length === 0) {
      pushLine({ type: "sys", text: "myomarchy jsh — type 'help' to begin" });
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

  return (
    <Window appId="terminal" title="developer@myomarchy: jsh" accent={`var(--neon-${config.accent})`}>
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
                  setHistIdx(next); setInput(cmdHistory[next] ?? "");
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  if (histIdx === null) return;
                  const next = histIdx + 1;
                  if (next >= cmdHistory.length) { setHistIdx(null); setInput(""); }
                  else { setHistIdx(next); setInput(cmdHistory[next]); }
                }
              }}
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
