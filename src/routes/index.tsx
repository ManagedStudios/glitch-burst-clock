import { createFileRoute } from "@tanstack/react-router";
import { HackathonHeader } from "@/components/HackathonHeader";
import { CountdownTimer } from "@/components/CountdownTimer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EuroTech Hackathon · Countdown" },
      { name: "description", content: "Premium cyberpunk countdown timer for the EuroTech Hackathon, in cooperation with HKTE." },
      { property: "og:title", content: "EuroTech Hackathon · Countdown" },
      { property: "og:description", content: "Premium cyberpunk countdown timer for the EuroTech Hackathon." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <HackathonHeader />
        <CountdownTimer />
        <footer className="text-center label-mono opacity-70">
          // SYSTEM READY · 60FPS · v1.0 //
        </footer>
      </div>
    </main>
  );
}
