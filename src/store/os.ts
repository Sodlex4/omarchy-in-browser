import { create } from "zustand";

export type AppId = "terminal" | "keybindings" | "config" | "install" | "files";

export type TerminalLine = { id: number; type: "in" | "out" | "sys"; text: string };

export type Config = {
  borderRadius: number;
  gap: number;
  accent: "green" | "purple" | "blue" | "pink";
  opacity: number;
  font: number;
};

type State = {
  booted: boolean;
  launcherOpen: boolean;
  activeApp: AppId | null;
  openApps: AppId[];
  cwd: string;
  history: TerminalLine[];
  cmdHistory: string[];
  config: Config;
  pressedKeys: string[];
  setBooted: (b: boolean) => void;
  toggleLauncher: () => void;
  openApp: (a: AppId) => void;
  closeApp: (a: AppId) => void;
  focusApp: (a: AppId) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
  clearTerm: () => void;
  setCwd: (p: string) => void;
  pushCmd: (c: string) => void;
  setConfig: (c: Partial<Config>) => void;
  setPressed: (keys: string[]) => void;
};

let lineId = 0;

export const useOS = create<State>((set) => ({
  booted: false,
  launcherOpen: false,
  activeApp: null,
  openApps: [],
  cwd: "~",
  history: [],
  cmdHistory: [],
  config: { borderRadius: 8, gap: 12, accent: "green", opacity: 92, font: 14 },
  pressedKeys: [],
  setBooted: (b) => set({ booted: b }),
  toggleLauncher: () => set((s) => ({ launcherOpen: !s.launcherOpen })),
  openApp: (a) =>
    set((s) => ({
      activeApp: a,
      launcherOpen: false,
      openApps: s.openApps.includes(a) ? s.openApps : [...s.openApps, a],
    })),
  closeApp: (a) =>
    set((s) => {
      const openApps = s.openApps.filter((x) => x !== a);
      return { openApps, activeApp: openApps[openApps.length - 1] ?? null };
    }),
  focusApp: (a) => set({ activeApp: a }),
  pushLine: (line) => set((s) => ({ history: [...s.history, { ...line, id: ++lineId }] })),
  clearTerm: () => set({ history: [] }),
  setCwd: (p) => set({ cwd: p }),
  pushCmd: (c) => set((s) => ({ cmdHistory: [...s.cmdHistory, c] })),
  setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
  setPressed: (keys) => set({ pressedKeys: keys }),
}));
