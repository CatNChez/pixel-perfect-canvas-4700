import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/Shell";
import { ProfileForm } from "@/components/ProfileForm";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile & Team — CATty" },
      { name: "description", content: "Edit your name, role, team, coach, members, goals and practice schedule." },
      { property: "og:title", content: "My Profile & Team — CATty" },
      { property: "og:description", content: "Edit your CATty profile and team details." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader kicker="Account" title="PROFILE & TEAM" />
      <ProfileForm />
    </div>
  ),
});
