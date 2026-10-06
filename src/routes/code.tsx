import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/Shell";
import { CodeWorkspace } from "@/components/CodeWorkspace";
import { ChallengesPanel } from "@/components/ChallengesPanel";
import type { Challenge } from "@/lib/store";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Code Workspace — CATty" },
      { name: "description", content: "Write, run, save, import and export Python, VEX V5 Python, C++, VEX V5 C++ and PROS/LemLib robot code." },
      { property: "og:title", content: "Code Workspace — CATty" },
      { property: "og:description", content: "Write, run, save, import and export Python, VEX V5 Python, C++, VEX V5 C++ and PROS/LemLib robot code." },
    ],
  }),
  component: CodePage,
});

function CodePage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  return (
    <div>
      <PageHeader kicker="Workspace" title="CODE" />
      <CodeWorkspace challenge={challenge} onClearChallenge={() => setChallenge(null)} />
      <h2 className="hud-label mb-3 mt-8">Coding Challenges</h2>
      <ChallengesPanel activeId={challenge?.id ?? null} onStart={(c) => { setChallenge(c); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </div>
  );
}
