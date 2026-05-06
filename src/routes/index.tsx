import { createFileRoute } from "@tanstack/react-router";
import { useOS } from "@/store/os";
import { useGlobalKeys } from "@/hooks/useGlobalKeys";
import { Boot } from "@/features/Boot";
import { Desktop } from "@/features/Desktop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MyOmarchy — A Browser Dev OS" },
      { name: "description", content: "Experience Omarchy in your browser. Interactive terminal, live config, and keybinding visualizer." },
      { property: "og:title", content: "MyOmarchy — A Browser Dev OS" },
      { property: "og:description", content: "Experience Omarchy in your browser. Interactive terminal, live config, and keybinding visualizer." },
    ],
  }),
  component: Index,
});

function Index() {
  const booted = useOS((s) => s.booted);
  useGlobalKeys();
  return (
    <>
      {!booted && <Boot />}
      {booted && <Desktop />}
    </>
  );
}
