import { create } from "zustand";

export type AppId = "terminal" | "keybindings" | "config" | "install" | "tmux-cheatsheet";

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

export type TmuxPane = {
  id: string;
  cwd: string;
  lines: TerminalLine[];
  input: string;
};

export type TmuxWindow = {
  name: string;
  layout:
    | "main-vertical"
    | "main-horizontal"
    | "even-vertical"
    | "even-horizontal"
    | "tiled"
    | "single";
  panes: TmuxPane[];
  activePane: number;
};

export type TmuxSession = {
  name: string;
  windows: TmuxWindow[];
  activeWindow: number;
};

type TmuxState = {
  active: boolean;
  sessions: TmuxSession[];
  activeSession: number;
  prefixMode: boolean;
  copyMode: boolean;
};

type State = {
  booted: boolean;
  launcherOpen: boolean;
  workspaces: Record<WorkspaceId, Workspace>;
  currentWs: WorkspaceId;
  lastWsDirection: 1 | -1;
  layout: "dwindle" | "master";
  gapsEnabled: boolean;
  terminal: "alacritty" | "ghostty" | "kitty";
  cwd: string;
  history: TerminalLine[];
  cmdHistory: string[];
  config: Config;
  pressedKeys: string[];
  lineId: number;
  paneId: number;
  tmux: TmuxState;
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
  nextWorkspace: () => void;
  prevWorkspace: () => void;
  moveAppToWorkspace: (id: WorkspaceId) => void;
  pushLine: (line: Omit<TerminalLine, "id">) => void;
  clearTerm: () => void;
  setCwd: (p: string) => void;
  pushCmd: (c: string) => void;
  setConfig: (c: Partial<Config>) => void;
  setPressed: (keys: string[]) => void;
  toggleLayout: () => void;
  toggleGaps: () => void;
  setTerminal: (t: "alacritty" | "ghostty" | "kitty") => void;
  // tmux actions
  tmuxNewSession: (name: string) => void;
  tmuxKillSession: () => void;
  tmuxRenameSession: (name: string) => void;
  tmuxNextSession: () => void;
  tmuxPrevSession: () => void;
  tmuxNewWindow: () => void;
  tmuxKillWindow: () => void;
  tmuxRenameWindow: (name: string) => void;
  tmuxNextWindow: () => void;
  tmuxPrevWindow: () => void;
  tmuxSplitPane: (direction: "v" | "h") => void;
  tmuxKillPane: () => void;
  tmuxZoomPane: () => void;
  tmuxFocusPane: (dir: "up" | "down" | "left" | "right") => void;
  tmuxTogglePrefix: () => void;
  tmuxSetCopyMode: (on: boolean) => void;
  tmuxExecCommand: (cmd: string) => void;
};

const emptyWorkspaces = (): Record<WorkspaceId, Workspace> =>
  WORKSPACE_IDS.reduce(
    (acc, id) => {
      acc[id] = { openApps: [], activeApp: null };
      return acc;
    },
    {} as Record<WorkspaceId, Workspace>,
  );

const newPane = (paneId: number, cwd = "~"): TmuxPane => ({
  id: `${paneId}`,
  cwd,
  lines: [],
  input: "",
});

const newWindow = (name = "0", idStart = 0): TmuxWindow => ({
  name,
  layout: "single",
  panes: [newPane(idStart + 1)],
  activePane: 0,
});

const newSession = (name = "0", idStart = 0): TmuxSession => ({
  name,
  windows: [newWindow("0", idStart)],
  activeWindow: 0,
});

export const useOS = create<State>((set, get) => ({
  booted: false,
  launcherOpen: false,
  workspaces: emptyWorkspaces(),
  currentWs: 1,
  lastWsDirection: 1,
  layout: "dwindle",
  gapsEnabled: true,
  terminal: "alacritty",
  cwd: "~",
  history: [],
  cmdHistory: [],
  config: { borderRadius: 8, gap: 12, accent: "green", opacity: 92, font: 14 },
  pressedKeys: [],
  lineId: 0,
  paneId: 0,
  tmux: { active: false, sessions: [], activeSession: 0, prefixMode: false, copyMode: false },

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
      const activeApp = ws.activeApp === a ? (openApps[openApps.length - 1] ?? null) : ws.activeApp;
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

  nextWorkspace: () =>
    set((s) => {
      const idx = WORKSPACE_IDS.indexOf(s.currentWs);
      const next = WORKSPACE_IDS[(idx + 1) % WORKSPACE_IDS.length];
      return { currentWs: next, lastWsDirection: 1 as 1, launcherOpen: false };
    }),

  prevWorkspace: () =>
    set((s) => {
      const idx = WORKSPACE_IDS.indexOf(s.currentWs);
      const prev = WORKSPACE_IDS[(idx - 1 + WORKSPACE_IDS.length) % WORKSPACE_IDS.length];
      return { currentWs: prev, lastWsDirection: -1 as -1, launcherOpen: false };
    }),

  moveAppToWorkspace: (id) =>
    set((s) => {
      const from = s.workspaces[s.currentWs];
      if (!from.activeApp || id === s.currentWs) return s;
      const app = from.activeApp;
      const fromOpen = from.openApps.filter((x) => x !== app);
      const target = s.workspaces[id];
      const targetOpen = target.openApps.includes(app)
        ? target.openApps
        : [...target.openApps, app];
      return {
        workspaces: {
          ...s.workspaces,
          [s.currentWs]: { openApps: fromOpen, activeApp: fromOpen[fromOpen.length - 1] ?? null },
          [id]: { openApps: targetOpen, activeApp: app },
        },
      };
    }),

  pushLine: (line) =>
    set((s) => ({ history: [...s.history, { ...line, id: s.lineId + 1 }], lineId: s.lineId + 1 })),
  clearTerm: () => set({ history: [] }),
  setCwd: (p) => set({ cwd: p }),
  pushCmd: (c) => set((s) => ({ cmdHistory: [...s.cmdHistory, c] })),
  setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
  setPressed: (keys) => set({ pressedKeys: keys }),
  toggleLayout: () => set((s) => ({ layout: s.layout === "dwindle" ? "master" : "dwindle" })),
  toggleGaps: () => set((s) => ({ gapsEnabled: !s.gapsEnabled })),
  setTerminal: (t) => set({ terminal: t }),

  tmuxNewSession: (name) =>
    set((s) => {
      const sessionName = name || `${s.tmux.sessions.length}`;
      const sessions = [...s.tmux.sessions, newSession(sessionName, s.paneId + 1)];
      return {
        tmux: { ...s.tmux, sessions, activeSession: sessions.length - 1 },
        paneId: s.paneId + 1,
      };
    }),

  tmuxKillSession: () =>
    set((s) => {
      const sessions = s.tmux.sessions.filter((_, i) => i !== s.tmux.activeSession);
      if (!sessions.length)
        return {
          tmux: {
            active: false,
            sessions: [],
            activeSession: 0,
            prefixMode: false,
            copyMode: false,
          },
        };
      return {
        tmux: {
          ...s.tmux,
          sessions,
          activeSession: Math.min(s.tmux.activeSession, sessions.length - 1),
        },
      };
    }),

  tmuxRenameSession: (name) =>
    set((s) => {
      const sessions = [...s.tmux.sessions];
      sessions[s.tmux.activeSession] = { ...sessions[s.tmux.activeSession], name };
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxNextSession: () =>
    set((s) => {
      if (s.tmux.sessions.length <= 1) return s;
      return {
        tmux: { ...s.tmux, activeSession: (s.tmux.activeSession + 1) % s.tmux.sessions.length },
      };
    }),

  tmuxPrevSession: () =>
    set((s) => {
      if (s.tmux.sessions.length <= 1) return s;
      return {
        tmux: {
          ...s.tmux,
          activeSession:
            (s.tmux.activeSession - 1 + s.tmux.sessions.length) % s.tmux.sessions.length,
        },
      };
    }),

  tmuxNewWindow: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const winName = `${session.windows.length}`;
      const windows = [...session.windows, newWindow(winName)];
      session.activeWindow = windows.length - 1;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions, paneId: s.paneId + 1 } };
    }),

  tmuxKillWindow: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = session.windows.filter((_, i) => i !== session.activeWindow);
      if (!windows.length) {
        sessions[s.tmux.activeSession] = {
          ...session,
          windows: [newWindow("0", s.paneId + 1)],
          activeWindow: 0,
        };
        return { tmux: { ...s.tmux, sessions, paneId: s.paneId + 1 } };
      } else {
        session.activeWindow = Math.min(session.activeWindow, windows.length - 1);
        session.windows = windows;
      }
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxRenameWindow: (name) =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      windows[session.activeWindow] = { ...windows[session.activeWindow], name };
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxNextWindow: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      session.activeWindow = (session.activeWindow + 1) % session.windows.length;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxPrevWindow: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      session.activeWindow =
        (session.activeWindow - 1 + session.windows.length) % session.windows.length;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxSplitPane: (direction) =>
    set((s) => {
      if (!s.tmux.active) return s;
      const newId = s.paneId + 1;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      const window = { ...windows[session.activeWindow] };
      const panes = [...window.panes, newPane(newId)];
      window.panes = panes;
      window.activePane = panes.length - 1;
      if (panes.length === 2)
        window.layout = direction === "v" ? "main-horizontal" : "main-vertical";
      else if (panes.length <= 3) window.layout = "even-vertical";
      else window.layout = "tiled";
      windows[session.activeWindow] = window;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions }, paneId: newId };
    }),

  tmuxKillPane: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      const window = { ...windows[session.activeWindow] };
      const panes = window.panes.filter((_, i) => i !== window.activePane);
      if (!panes.length) {
        const newId = s.paneId + 1;
        panes.push(newPane(newId));
        window.panes = panes;
        window.activePane = 0;
        window.layout = "single";
        windows[session.activeWindow] = window;
        session.windows = windows;
        sessions[s.tmux.activeSession] = session;
        return { tmux: { ...s.tmux, sessions }, paneId: newId };
      }
      window.panes = panes;
      window.activePane = Math.min(window.activePane, panes.length - 1);
      window.layout = panes.length <= 1 ? "single" : panes.length <= 3 ? "even-vertical" : "tiled";
      windows[session.activeWindow] = window;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxZoomPane: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      const window = { ...windows[session.activeWindow] };
      window.layout =
        window.layout === "single"
          ? window.panes.length > 1
            ? "even-vertical"
            : "single"
          : "single";
      windows[session.activeWindow] = window;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxFocusPane: (dir) =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      const window = { ...windows[session.activeWindow] };
      const cols = window.panes.length <= 2 ? 1 : window.panes.length <= 4 ? 2 : 3;
      const rows = Math.ceil(window.panes.length / cols);
      const currentRow = Math.floor(window.activePane / cols);
      const currentCol = window.activePane % cols;
      let nextRow = currentRow;
      let nextCol = currentCol;
      if (dir === "up") nextRow = Math.max(0, currentRow - 1);
      if (dir === "down") nextRow = Math.min(rows - 1, currentRow + 1);
      if (dir === "left") nextCol = Math.max(0, currentCol - 1);
      if (dir === "right") nextCol = Math.min(cols - 1, currentCol + 1);
      const nextPane = Math.min(nextRow * cols + nextCol, window.panes.length - 1);
      window.activePane = nextPane;
      windows[session.activeWindow] = window;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions } };
    }),

  tmuxTogglePrefix: () =>
    set((s) => {
      if (!s.tmux.active) return s;
      return { tmux: { ...s.tmux, prefixMode: !s.tmux.prefixMode } };
    }),

  tmuxSetCopyMode: (on) =>
    set((s) => {
      if (!s.tmux.active) return s;
      return { tmux: { ...s.tmux, copyMode: on } };
    }),

  tmuxExecCommand: (cmd) =>
    set((s) => {
      if (!s.tmux.active) return s;
      const sessions = [...s.tmux.sessions];
      const session = { ...sessions[s.tmux.activeSession] };
      const windows = [...session.windows];
      const window = { ...windows[session.activeWindow] };
      const panes = [...window.panes];
      const pane = { ...panes[window.activePane] };
      const trimmed = cmd.trim();
      let nextLineId = s.lineId + 1;
      pane.lines.push({ id: nextLineId++, type: "in", text: `${pane.cwd} ❯ ${cmd}` });
      if (!trimmed) {
        panes[window.activePane] = pane;
        window.panes = panes;
        windows[session.activeWindow] = window;
        session.windows = windows;
        sessions[s.tmux.activeSession] = session;
        return { tmux: { ...s.tmux, sessions }, lineId: nextLineId - 1 };
      }
      const handleOut = (text: string) => {
        pane.lines.push({ id: nextLineId++, type: "out", text });
      };
      const handleSys = (text: string) => {
        pane.lines.push({ id: nextLineId++, type: "sys", text });
      };
      const [c, ...args] = trimmed.split(/\s+/);
      switch (c) {
        case "help":
          handleOut(
            "Commands: help, ls, cd, pwd, cat, clear, neofetch, theme, echo, whoami, date, exit",
          );
          break;
        case "neofetch":
          handleSys("       .--.       OS: Omarchy 1.0 (browser)");
          handleSys("      |o_o |      Host: tmux session");
          handleSys("      |:_/ |      Kernel: react 19 + tanstack");
          handleSys("     //   \\ \\     WM: hyprland-sim");
          handleSys("    (|     | )    Shell: jsh 1.0");
          handleSys("   /'\\_   _/`\\    Theme: tokyo-night");
          handleSys("   \\___)=(___/    CPU: V8 (4) @ 3.0GHz");
          break;
        case "clear":
          pane.lines = [];
          break;
        case "echo":
          handleOut(args.join(" "));
          break;
        case "whoami":
          handleOut("developer");
          break;
        case "date":
          handleOut(new Date().toString());
          break;
        case "pwd":
          handleOut(pane.cwd);
          break;
        case "theme": {
          const t = args[0] as "green" | "purple" | "blue" | "pink";
          if (["green", "purple", "blue", "pink"].includes(t)) {
            set({ config: { ...get().config, accent: t } });
            handleSys(`accent → ${t}`);
          } else {
            handleOut("usage: theme green|purple|blue|pink");
          }
          break;
        }
        case "exit":
          handleSys("detached from tmux");
          break;
        default:
          handleOut(`command not found: ${c}. try 'help'`);
      }
      panes[window.activePane] = pane;
      window.panes = panes;
      windows[session.activeWindow] = window;
      session.windows = windows;
      sessions[s.tmux.activeSession] = session;
      return { tmux: { ...s.tmux, sessions }, lineId: nextLineId - 1 };
    }),
}));
