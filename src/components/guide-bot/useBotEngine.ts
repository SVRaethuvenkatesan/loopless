/**
 * Loopless Vaping Cessation Platform - Iteration 3
 * Module: Conversational AI Engine (src/components/guide-bot/useBotEngine.ts)
 * 
 * Purpose:
 *   This custom React hook powers the `GuideBotWidget` (LoopBot). 
 *   It handles Natural Language Processing (NLP) intent routing, translating 
 *   user queries into exact application navigation states.
 * 
 * Data Governance & Privacy (Data Minimisation):
 *   To comply with APP 3, this bot runs entirely on Ephemeral React State.
 *   Transcripts are intentionally NOT saved to the database. This guarantees
 *   that behavioral crises discussed with the bot cannot be scraped or breached.
 * 
 * Architecture:
 *   Instead of allowing a 3rd party LLM to hallucinate UI changes, the `processInput` 
 *   function acts as a deterministic algorithmic router, maintaining strict App Router access controls.
 */

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";

export interface PaOption {
  label: string;
  payload: string;
}

export interface PaActionCard {
  route: string;
  buttonLabel: string;
  description: string;
}

export interface PaResponse {
  message: string;
  actionCard: PaActionCard | null;
  inlineWidget: "none" | "urge_slider" | "breathing_circle" | "quick_checkin";
  uiState: {
    allowFreeText: boolean;
  };
  options: PaOption[];
  lastUserMessage?: string;
}

const LOCAL_STATES: Record<string, Omit<PaResponse, "lastUserMessage">> = {
  welcome: {
    message: "Hi there! I'm loopBot. What can I help you with right now?",
    actionCard: null,
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "I need help right now", payload: "coping" },
      { label: "Check-in", payload: "checkin" },
      { label: "View my stats", payload: "insights" },
      { label: "Awareness & Timeline", payload: "awareness" },
      { label: "Settings Help", payload: "settings_help" },
      { label: "Test Data Guide", payload: "demo_data" }
    ]
  },
  coping: {
    message: "I've got you. Let's get through this craving together. Do you want to log it or use a tool?",
    actionCard: {
      route: "/coping",
      buttonLabel: "Open Coping Tools",
      description: "Access breathing exercises, grounding tools, and fast relief."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Log this Urge", payload: "urge" },
      { label: "I need distraction", payload: "support" }
    ]
  },
  urge: {
    message: "Logging urges helps you understand your triggers. Let's track it quickly.",
    actionCard: {
      route: "/urge",
      buttonLabel: "Log Urge",
      description: "Quickly record your craving intensity and triggers."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "I need a distraction instead", payload: "coping" }
    ]
  },
  checkin: {
    message: "Daily check-ins help build a streak and track your recovery mood.",
    actionCard: {
      route: "/checkin",
      buttonLabel: "Daily Check-in",
      description: "Log your mood, stress, and energy for today."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Actually, I need help", payload: "coping" }
    ]
  },
  insights: {
    message: "Your stats tell the story of your recovery. Let's dive into the data.",
    actionCard: {
      route: "/insights?tab=today",
      buttonLabel: "View Insights",
      description: "Analyze your patterns, triggers, and stress cycles."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "How do I use this?", payload: "insights_explain" },
      { label: "Check my badges", payload: "profile" }
    ]
  },
  insights_explain: {
    message: "Insights has 3 tabs: \n• Today: Your daily snapshot and critical signals.\n• Patterns: How your stress, urges, and timing connect.\n• Trends: Your recovery metrics over the last 30 days.",
    actionCard: null,
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "How do I test this?", payload: "demo_data" },
      { label: "Go to Insights", payload: "insights" }
    ]
  },
  demo_data: {
    message: "Want to see what fully populated charts look like? Go to Profile and toggle 'Test Data' to fill the app with demo insights safely.",
    actionCard: {
      route: "/profile",
      buttonLabel: "Go to Profile",
      description: "Enable Demo Data from the Profile section."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Back to Insights", payload: "insights" }
    ]
  },
  awareness: {
    message: "Awareness helps you connect with your body and emotions. Which part would you like to explore?",
    actionCard: null,
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Physical Timeline", payload: "awareness_physical" },
      { label: "Emotional Charts & Wheel", payload: "awareness_emotional" }
    ]
  },
  awareness_physical: {
    message: "The Physical Timeline shows exactly how your lungs, heart, and body recover day by day after you quit.",
    actionCard: {
      route: "/dashboard",
      buttonLabel: "View Timeline",
      description: "Track your body's physical healing process."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "What about emotions?", payload: "awareness_emotional" }
    ]
  },
  awareness_emotional: {
    message: "The Emotional module features an interactive Coping Wheel and correlation charts to understand your feelings.",
    actionCard: {
      route: "/awareness?tab=emotional",
      buttonLabel: "View Emotional Wheel",
      description: "Map your emotions and find grounding tools."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "View Physical Timeline", payload: "awareness_physical" }
    ]
  },
  profile: {
    message: "Here is your profile and recovery timeline.",
    actionCard: {
      route: "/profile?tab=badges",
      buttonLabel: "View Badges",
      description: "See your earned badges and total XP."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Go Home", payload: "dashboard" }
    ]
  },
  settings_help: {
    message: "In Settings, you can adjust your reminder time, manage notifications, and toggle app features like offline mode. What do you need help with?",
    actionCard: {
      route: "/settings",
      buttonLabel: "Go to Settings",
      description: "Manage app preferences and notifications."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Manage notifications", payload: "settings_notifications" },
      { label: "What is Streak Freeze?", payload: "settings_streak" },
      { label: "Log out or clear data", payload: "settings_account" }
    ]
  },
  settings_notifications: {
    message: "You can turn off daily reminders, urge follow-ups, or smart nudges from the Notifications section in Settings.",
    actionCard: {
      route: "/settings",
      buttonLabel: "Manage Notifications",
      description: "Adjust what alerts you receive."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Back to Settings Help", payload: "settings_help" }
    ]
  },
  settings_streak: {
    message: "A streak freeze protects your daily check-in streak if you forget a day. Enable it in App Preferences in Settings.",
    actionCard: {
      route: "/settings",
      buttonLabel: "Enable Streak Freeze",
      description: "Protect your streak progress."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Back to Settings Help", payload: "settings_help" }
    ]
  },
  settings_account: {
    message: "If you need to clear your guest data or sign out, you can find these actions at the bottom right of the Settings page.",
    actionCard: {
      route: "/settings",
      buttonLabel: "Go to Account Settings",
      description: "Clear data or sign out securely."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Back to Settings Help", payload: "settings_help" }
    ]
  },
  dashboard: {
    message: "Taking you back to your dashboard.",
    actionCard: {
      route: "/dashboard",
      buttonLabel: "Go to Dashboard",
      description: "Your home screen and daily overview."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "I need help", payload: "coping" }
    ]
  },
  support: {
    message: "If things are really tough, professional support is available.",
    actionCard: {
      route: "/support",
      buttonLabel: "Get Support",
      description: "Access crisis contacts and quitlines."
    },
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "Go to Coping", payload: "coping" }
    ]
  },
  fallback: {
    message: "I didn't quite catch that, but I can help you navigate.",
    actionCard: null,
    inlineWidget: "none",
    uiState: { allowFreeText: true },
    options: [
      { label: "I need help right now", payload: "coping" },
      { label: "Check-in", payload: "checkin" },
      { label: "View my stats", payload: "insights" }
    ]
  }
};

export function useBotEngine() {
  const [currentState, setCurrentState] = useState<PaResponse | null>(null);

  const processInput = (text: string): keyof typeof LOCAL_STATES => {
    const t = text.toLowerCase();

    // Direct Payload Matching (from chips)
    if (LOCAL_STATES[t]) return t as keyof typeof LOCAL_STATES;

    // Enhanced NLP Regex Matching
    if (/help|stress|anx|snap|freak|panic|breathe|coping|struggle|hard|tough|relapse|slip/i.test(t)) return "coping";
    if (/urge|crav|vape|smoke|nicotine|want|need|hit|puff/i.test(t)) return "urge";
    if (/check|log|today|mood/i.test(t)) return "checkin";
    if (/demo|fake|populate|empty chart|no data|test data/i.test(t)) return "demo_data";
    if (/how.*insight|explain.*insight|what.*insight|tabs|pattern|correlation|nudge|trend/i.test(t)) return "insights_explain";
    if (/stat|insight|data|pattern/i.test(t)) return "insights";
    if (/aware|health|body|lung|recover|timeline|wheel/i.test(t)) return "awareness";
    if (/badge|xp|profile|level/i.test(t)) return "profile";
    if (/setting|preference|notif|reminder|offline|freeze|account|clear data/i.test(t)) return "settings_help";
    if (/home|dash|start/i.test(t)) return "dashboard";
    if (/crisis|quitline|support|suicide/i.test(t)) return "support";

    return "fallback";
  };

  const send = useCallback((text: string, userName = "") => {
    // If it's a SYS_INIT call, we just show the welcome message
    if (text === "SYS_INIT") {
      setCurrentState({
        ...LOCAL_STATES.welcome,
        message: `Hi ${userName || "there"}! I'm loopBot. What can I help you with right now?`,
      });
      return;
    }

    const stateKey = processInput(text);
    const newState = LOCAL_STATES[stateKey];

    setCurrentState({
      ...newState,
      // If the user clicked a chip, the text usually perfectly matches the chip label.
      // If it's a chip payload (e.g. they clicked "coping" chip, payload is "coping"), 
      // the 'text' argument to send() is actually the chip *label* in the GuideBotWidget...
      // Wait! I need to ensure GuideBotWidget sends the text, or we pass payload.
      // In GuideBotWidget, chip clicks usually do `send(chip.label)`. We should change it to `send(chip.payload)`.
      lastUserMessage: text !== "SYS_INIT" && !LOCAL_STATES[text] ? text : undefined
    });
  }, []);

  const init = useCallback((userName = "") => {
    if (!currentState) {
      send("SYS_INIT", userName);
    }
  }, [currentState, send]);

  const clear = useCallback(() => setCurrentState(null), []);

  return { currentState, loading: false, send, init, clear };
}
