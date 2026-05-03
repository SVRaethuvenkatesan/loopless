import re

with open(r'e:\loopless\loopless\src\app\(app)\onboarding\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace STEPS definitions
old_steps = """const STEPS = [
  {
    id: 0,
    title: "How old are you?",
    sub: "Helps us personalise tools for your life stage.",
    emoji: "🎂",
    accent: "#5a8f6a",
    shadow: "#3d6b4f",
    bg: "#e8f5ec",
  },
  {
    id: 1,
    title: "What triggers your urge?",
    sub: "Pick all that apply - we'll build your toolkit around these.",
    emoji: "😤",
    accent: "#e07b5a",
    shadow: "#a84f2a",
    bg: "#fdf0ea",
  },
  {
    id: 2,
    title: "How do you cope best?",
    sub: "We'll prioritise these tools so they surface when you need them.",
    emoji: "🧘",
    accent: "#c9982a",
    shadow: "#8c6400",
    bg: "#fffbef",
  },
  {
    id: 3,
    title: "Notification preferences",
    sub: "Choose what feels comfortable - you can always change this later.",
    emoji: "🔔",
    accent: "#7b6fa0",
    shadow: "#4e4478",
    bg: "#f0edf8",
  },
  {
    id: 4,
    title: "You're all set! 🎉",
    sub: "Your personalised Loopless experience is ready.",
    emoji: "🏆",
    accent: "#5a8f6a",
    shadow: "#3d6b4f",
    bg: "#e8f5ec",
  },
];"""

new_steps = """const STEPS = [
  {
    id: 0,
    title: "How old are you?",
    sub: "Helps us personalise tools for your life stage.",
    emoji: "🎂",
    accent: "var(--mint)",
    shadow: "var(--shadow-mint)",
    bg: "var(--mint3)",
    glow: "var(--mint-glow)",
  },
  {
    id: 1,
    title: "What triggers your urge?",
    sub: "Pick all that apply - we'll build your toolkit around these.",
    emoji: "😤",
    accent: "var(--coral)",
    shadow: "var(--shadow-coral)",
    bg: "var(--coral3)",
    glow: "var(--coral-glow)",
  },
  {
    id: 2,
    title: "How do you cope best?",
    sub: "We'll prioritise these tools so they surface when you need them.",
    emoji: "🧘",
    accent: "var(--amber)",
    shadow: "var(--shadow-amber)",
    bg: "var(--amber3)",
    glow: "var(--amber-glow)",
  },
  {
    id: 3,
    title: "Notification preferences",
    sub: "Choose what feels comfortable - you can always change this later.",
    emoji: "🔔",
    accent: "var(--purple)",
    shadow: "var(--shadow-purple)",
    bg: "var(--lilac)",
    glow: "var(--shadow-purple)",
  },
  {
    id: 4,
    title: "You're all set! 🎉",
    sub: "Your personalised Loopless experience is ready.",
    emoji: "🏆",
    accent: "var(--mint)",
    shadow: "var(--shadow-mint)",
    bg: "var(--mint3)",
    glow: "var(--mint-glow)",
  },
];"""

text = text.replace(old_steps, new_steps)

# Replace box-shadow strings that use ${cur.shadow}44
text = text.replace('boxShadow: sel\n                            ? `3px 3px 0 ${cur.shadow}44`', 'boxShadow: sel\n                            ? `3px 3px 0 ${cur.shadow}`')

# Replace blob backgrounds
text = text.replace('background: `radial-gradient(circle,${cur.accent}20 0%,transparent 70%)`,', 'background: `radial-gradient(circle, ${cur.glow} 0%, transparent 70%)`,')
text = text.replace('background: `radial-gradient(circle,${cur.accent}14 0%,transparent 70%)`,', 'background: `radial-gradient(circle, ${cur.glow} 0%, transparent 70%)`,')
text = text.replace('background: `radial-gradient(circle,${cur.accent}30 0%,transparent 75%)`,', 'background: `radial-gradient(circle, ${cur.glow} 0%, transparent 75%)`,')

with open(r'e:\loopless\loopless\src\app\(app)\onboarding\page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done applying STEPS and blobs!')
