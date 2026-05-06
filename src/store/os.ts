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

export type Workspace = { openApps: AppId[]; activeApp: AppId | null };

export const WORKSPACE_IDS = [1, 2, 3, 4, 5] as const;
export type WorkspaceId = (typeof WORKSPACE_IDS)[number];

type State = {
  booted: boolean;
  launcherOpen: boolean;
  workspaces: Record<WorkspaceId, Workspace>;
  currentWs: WorkspaceId;
  lastWsDirection: 1 | -1;
  cwd: string;
  history: TerminalLine[];
  cmdHistory: string[];
  config: Config;
  pressedKeys: string[];
  // derived getters
  getActiveApp: () => AppId | null;
  getOpenApps: () => AppId[];
  // actions
  setBooted: (b: boolean) => void;
  toggleLauncher: () => void;
  openApp: (a: AppId) => void;
  closeApp: (a: AppId) => void;
  focusApp: (a: AppId) => void;
  switchWorkspace: (id: WorkspaceId) => void;
  moveAppToWorkspace: (id: WorkspaceId) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
  clearTerm: () => void;
  setCwd: (p: string) => void;
  pushCmd: (c: string) => void;
  setConfig: (c: Partial<Config>) => void;
  setPressed: (keys: string[]) => void;
};

let lineId = 0;

const emptyWorkspaces = (): Record<WorkspaceId, Workspace> =>
  WORKSPACE_IDS.reduce((acc, id) => {
    acc[id] = { openApps: [], activeApp: null };
    return acc;
  }, {} as Record<WorkspaceId, Workspace>);

export const useOS = create<State>((set, get) => ({
  booted: false,
  launcherOpen: false,
  workspaces: emptyWorkspaces(),
  currentWs: 1,
  lastWsDirection: 1,
  cwd: "~",
  history: [],
  cmdHistory: [],
  config: { borderRadius: 8, gap: 12, accent: "green", opacity: 92, font: 14 },
  pressedKeys: [],

  getActiveApp: () => get().workspaces[get().currentWs].activeApp,
  getOpenApps: () => get().workspaces[get().currentWs].openApps,

  setBooted: (b) => set({ booted: b }),
  toggleLauncher: () => set((s) => ({ launcherOpen: !s.launcherOpen })),

  openApp: (a) =>
    set((s) => {
      const ws = s.workspaces[s.currentWs];
      const openApps = ws.openApps.includes(a) ? ws.openApps : [...ws.openApps, a];
      return {
        launcherOpen: false,
        workspaces: { ...s.workspaces, [s.currentWs]: { openApps, activeApp: a } },
      };
    }),

  closeApp: (a) =>
    set((s) => {
      const ws = s.workspaces[s.currentWs];
      const openApps = ws.openApps.filter((x) => x !== a);
      const activeApp = ws.activeApp === a ? openApps[openApps.length - 1] ?? null : ws.activeApp;
      return {
        workspaces: { ...s.workspaces, [s.currentWs]: { openApps, activeApp } },
      };
    }),

  focusApp: (a) =>
    set((s) => ({
      workspaces: {
        ...s.workspaces,
        [s.currentWs]: { ...s.workspaces[s.currentWs], activeApp: a },
      },
    })),

  switchWorkspace: (id) =>
    set((s) => {
      if (id === s.currentWs) return s;
      return { currentWs: id, lastWsDirection: id > s.currentWs ? 1 : -1, launcherOpen: false };
    }),

  moveAppToWorkspace: (id) =>
    set((s) => {
      const from = s.workspaces[s.currentWs];
      if (!from.activeApp || id === s.currentWs) return s;
      const app = from.activeApp;
      const fromOpen = from.openApps.filter((x) => x !== app);
      const target = s.workspaces[id];
      const targetOpen = target.openApps.includes(app) ? target.openApps : [...target.openApps, app];
      return {
        workspaces: {
          ...s.workspaces,
          [s.currentWs]: { openApps: fromOpen, activeApp: fromOpen[fromOpen.length - 1] ?? null },
          [id]: { openApps: targetOpen, activeApp: app },
        },
      };
    }),

  pushLine: (line) => set((s) => ({ history: [...s.history, { ...line, id: ++lineId }] })),
  clearTerm: () => set({ history: [] }),
  setCwd: (p) => set({ cwd: p }),
  pushCmd: (c) => set((s) => ({ cmdHistory: [...s.cmdHistory, c] })),
  setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
  setPressed: (keys) => set({ pressedKeys: keys }),
}));
