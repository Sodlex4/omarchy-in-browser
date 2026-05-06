import { useEffect } from "react";
import { useOS, WORKSPACE_IDS, type WorkspaceId } from "@/store/os";

export function useGlobalKeys() {
  const { booted, openApp, toggleLauncher, closeApp, setPressed, switchWorkspace, moveAppToWorkspace } = useOS();

  useEffect(() => {
    if (!booted) return;
    const pressed = new Set<string>();

    const norm = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS" || (e.altKey && e.key === "Alt")) return "Super";
      if (e.key === "Control") return "Ctrl";
      if (e.key === "Shift") return "Shift";
      if (e.key === " ") return "Space";
      if (e.key.length === 1) return e.key.toUpperCase();
      return e.key;
    };

    const update = () => setPressed(Array.from(pressed));

    const onDown = (e: KeyboardEvent) => {
      // Treat Alt as Super to avoid OS conflicts.
      const isSuper = e.metaKey || e.altKey;
      if (isSuper) pressed.add("Super");
      if (e.shiftKey) pressed.add("Shift");
      const k = norm(e);
      if (k !== "Super") pressed.add(k);
      update();

      if (!isSuper) return;
      const key = e.key.toLowerCase();

      // Workspace shortcuts: Alt+1..5 switch, Alt+Shift+1..5 move active app
      const num = parseInt(key, 10);
      if (!Number.isNaN(num) && WORKSPACE_IDS.includes(num as WorkspaceId)) {
        e.preventDefault();
        const id = num as WorkspaceId;
        if (e.shiftKey) moveAppToWorkspace(id);
        else switchWorkspace(id);
        return;
      }

      // Read fresh state so shortcuts respect current workspace
      const state = useOS.getState();
      const activeApp = state.workspaces[state.currentWs].activeApp;

      if (key === "enter") { e.preventDefault(); openApp("terminal"); }
      else if (key === "d") { e.preventDefault(); toggleLauncher(); }
      else if (key === "k") { e.preventDefault(); openApp("keybindings"); }
      else if (key === "c") { e.preventDefault(); openApp("config"); }
      else if (key === "i") { e.preventDefault(); openApp("install"); }
      else if (key === "q") { e.preventDefault(); if (activeApp) closeApp(activeApp); }
    };

    const onUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.altKey) pressed.delete("Super");
      if (!e.shiftKey) pressed.delete("Shift");
      pressed.delete(norm(e));
      update();
    };

    const onBlur = () => { pressed.clear(); update(); };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [booted, openApp, toggleLauncher, closeApp, setPressed, switchWorkspace, moveAppToWorkspace]);
}
