import { useEffect } from "react";
import { useOS, WORKSPACE_IDS, type WorkspaceId } from "@/store/os";

export function useGlobalKeys() {
  const {
    booted,
    openApp,
    toggleLauncher,
    closeApp,
    setPressed,
    switchWorkspace,
    moveAppToWorkspace,
    nextWorkspace,
    prevWorkspace,
    toggleLayout,
    toggleGaps,
  } = useOS();

  useEffect(() => {
    if (!booted) return;
    const pressed = new Set<string>();

    const norm = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS" || (e.altKey && e.key === "Alt")) return "Super";
      if (e.key === "Control") return "Ctrl";
      if (e.key === "Shift") return "Shift";
      if (e.key === " ") return "Space";
      if (e.key === "Backspace") return "Backspace";
      if (e.key === "Tab") return "Tab";
      if (e.key === "Escape") return "Escape";
      if (e.key === "ArrowUp") return "ArrowUp";
      if (e.key === "ArrowDown") return "ArrowDown";
      if (e.key === "ArrowLeft") return "ArrowLeft";
      if (e.key === "ArrowRight") return "ArrowRight";
      if (e.key.length === 1) return e.key.toUpperCase();
      return e.key;
    };

    const update = () => setPressed(Array.from(pressed));

    const onDown = (e: KeyboardEvent) => {
      const state = useOS.getState();
      const isTmuxPrefix = e.ctrlKey && (e.key === " " || e.key === "b" || e.key === "B");

      if (isTmuxPrefix && state.tmux.active) {
        e.preventDefault();
        state.tmuxTogglePrefix();
        return;
      }

      if (state.tmux.active && state.tmux.prefixMode) {
        const tmuxKey = e.key.toLowerCase();
        if (tmuxKey === "v") {
          state.tmuxSplitPane("v");
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "h") {
          state.tmuxSplitPane("h");
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "x") {
          state.tmuxKillPane();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "z") {
          state.tmuxZoomPane();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "c") {
          state.tmuxNewWindow();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "k") {
          state.tmuxKillWindow();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "n") {
          state.tmuxNextWindow();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "p") {
          state.tmuxPrevWindow();
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "[") {
          state.tmuxSetCopyMode(true);
          state.tmuxTogglePrefix();
          return;
        }
        if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(tmuxKey)) {
          const dir = tmuxKey.replace("arrow", "") as "up" | "down" | "left" | "right";
          state.tmuxFocusPane(dir);
          state.tmuxTogglePrefix();
          return;
        }
        if (tmuxKey === "escape") {
          state.tmuxTogglePrefix();
          return;
        }
      }

      const isSuper = e.metaKey || e.altKey;
      if (isSuper) pressed.add("Super");
      if (e.shiftKey) pressed.add("Shift");
      if (e.ctrlKey) pressed.add("Ctrl");
      const k = norm(e);
      if (k !== "Super") pressed.add(k);
      update();

      if (!isSuper) return;

      const activeApp = state.workspaces[state.currentWs].activeApp;

      const key = e.key.toLowerCase();
      const num = parseInt(key, 10);
      if (!Number.isNaN(num) && WORKSPACE_IDS.includes(num as WorkspaceId)) {
        e.preventDefault();
        const id = num as WorkspaceId;
        if (e.shiftKey) moveAppToWorkspace(id);
        else switchWorkspace(id);
        return;
      }

      if (key === "tab") {
        e.preventDefault();
        if (e.shiftKey) prevWorkspace();
        else nextWorkspace();
        return;
      }

      if (key === "w") {
        e.preventDefault();
        if (activeApp) closeApp(activeApp);
        return;
      }

      if (key === "l") {
        e.preventDefault();
        if (e.shiftKey && e.ctrlKey) {
          /* lock */
        } else if (e.ctrlKey) {
          /* zoom out */
        } else toggleLayout();
        return;
      }

      if (key === "f") {
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
        return;
      }

      if (key === " ") {
        e.preventDefault();
        toggleLauncher();
        return;
      }

      if (key === "d") {
        e.preventDefault();
        toggleLauncher();
        return;
      }

      if (key === "k") {
        e.preventDefault();
        openApp("keybindings");
        return;
      }

      if (key === "c") {
        e.preventDefault();
        openApp("config");
        return;
      }

      if (key === "i") {
        e.preventDefault();
        openApp("install");
        return;
      }

      if (key === "enter") {
        e.preventDefault();
        openApp("terminal");
        return;
      }

      if (key === "backspace") {
        e.preventDefault();
        if (e.shiftKey && e.ctrlKey) toggleGaps();
        return;
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.altKey) pressed.delete("Super");
      if (!e.shiftKey) pressed.delete("Shift");
      if (!e.ctrlKey) pressed.delete("Ctrl");
      pressed.delete(norm(e));
      update();
    };

    const onBlur = () => {
      pressed.clear();
      update();
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [
    booted,
    openApp,
    toggleLauncher,
    closeApp,
    setPressed,
    switchWorkspace,
    moveAppToWorkspace,
    nextWorkspace,
    prevWorkspace,
    toggleLayout,
    toggleGaps,
  ]);
}
