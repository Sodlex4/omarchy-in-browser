import { useEffect } from "react";
import { useOS } from "@/store/os";

export function useGlobalKeys() {
  const { booted, openApp, toggleLauncher, closeApp, activeApp, setPressed } = useOS();

  useEffect(() => {
    if (!booted) return;
    const pressed = new Set<string>();

    const norm = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS" || e.altKey && e.key === "Alt") return "Super";
      if (e.key === "Control") return "Ctrl";
      if (e.key === " ") return "Space";
      if (e.key.length === 1) return e.key.toUpperCase();
      return e.key;
    };

    const update = () => setPressed(Array.from(pressed));

    const onDown = (e: KeyboardEvent) => {
      // Treat Alt as Super to avoid OS conflicts with the real Super key.
      const isSuper = e.metaKey || e.altKey;
      if (isSuper) pressed.add("Super");
      const k = norm(e);
      if (k !== "Super") pressed.add(k);
      update();

      if (isSuper) {
        const key = e.key.toLowerCase();
        if (key === "enter") { e.preventDefault(); openApp("terminal"); }
        else if (key === "d") { e.preventDefault(); toggleLauncher(); }
        else if (key === "k") { e.preventDefault(); openApp("keybindings"); }
        else if (key === "c") { e.preventDefault(); openApp("config"); }
        else if (key === "i") { e.preventDefault(); openApp("install"); }
        else if (key === "q") { e.preventDefault(); if (activeApp) closeApp(activeApp); }
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.altKey) pressed.delete("Super");
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
  }, [booted, openApp, toggleLauncher, closeApp, activeApp, setPressed]);
}
