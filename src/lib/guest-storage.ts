export type StoredGuest = {
  id: string;
  name: string;
  age?: string;
  triggers: string[];
};

export function getStoredGuest(): StoredGuest | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem("loopless_guest_id");
  if (!id) return null;

  let triggers: string[] = [];
  try {
    triggers = JSON.parse(localStorage.getItem("loopless_guest_triggers") ?? "[]");
  } catch {
    triggers = [];
  }

  return {
    id,
    name: localStorage.getItem("loopless_guest_name") || "Guest",
    age: localStorage.getItem("loopless_guest_age") ?? undefined,
    triggers,
  };
}

export function clearStoredGuest() {
  if (typeof window === "undefined") return;
  [
    "loopless_guest_id",
    "loopless_guest_name",
    "loopless_guest_triggers",
    "loopless_guest_age",
  ].forEach((key) => localStorage.removeItem(key));
}

export function setStoredGuest(input: StoredGuest) {
  if (typeof window === "undefined") return;
  localStorage.setItem("loopless_guest_id", input.id);
  localStorage.setItem("loopless_guest_name", input.name);
  if (input.age) localStorage.setItem("loopless_guest_age", input.age);
  localStorage.setItem("loopless_guest_triggers", JSON.stringify(input.triggers));
}
