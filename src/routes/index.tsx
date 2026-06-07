import { createFileRoute } from "@tanstack/react-router";
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
    <main className="relative h-screen w-screen overflow-hidden">
      <CountdownTimer />
    </main>
  );
}
