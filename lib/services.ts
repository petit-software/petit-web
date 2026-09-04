export interface Service {
  id: string;
  title: string;
  /** One line under the title on the card. */
  tagline: string;
  /** The drawer's copy. */
  description: string;
}

// The hand on the about page, in the order the cards are dealt.
export const services: Service[] = [
  {
    id: "agents",
    title: "AI Agents",
    tagline: "Agents that pay for themselves.",
    description:
      "Autonomous agents wired into the tools you already run, taking a job end to end: triage, research, outreach, follow-up. Each one is scoped to an outcome you can measure, so you know within weeks whether it earns its keep.",
  },
  {
    id: "automation",
    title: "Automation",
    tagline: "Repetitive work, turned into software that runs itself.",
    description:
      "The recurring work that eats a team's week, mapped and rebuilt as automations that run without anyone watching. We start with the process that costs the most hours and hand it back as time.",
  },
  {
    id: "software",
    title: "Custom AI Software",
    tagline: "Built around your problem, not around a model.",
    description:
      "Products designed from the problem outwards, with AI where it helps and plain software where it doesn't. Small, opinionated builds that ship in weeks and are yours to keep.",
  },
  {
    id: "tools",
    title: "Internal Tools",
    tagline: "Your team, building with AI, safely.",
    description:
      "We set your people up to build their own internal AI tools, with the guardrails, data handling and review that make it responsible. The goal is a team that keeps building after we leave.",
  },
  {
    id: "experiments",
    title: "Experiments",
    tagline: "Small bets, settled quickly.",
    description:
      "A week or two to find out whether an idea holds up before anyone commits to it: a working prototype in front of real users, and a clear answer at the end. Some go on to become products. The rest save you a quarter.",
  },
];
