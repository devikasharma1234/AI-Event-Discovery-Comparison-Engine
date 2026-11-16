import { useMemo, useSyncExternalStore } from "react";
import type { Event as PlanBeeEvent } from "../types/event";
import type { SearchEntry } from "../components/AIChat";

export interface Profile {
  name: string;
  city: string;
  interests: string[];
}

interface Workspace {
  profile: Profile;
  saved: PlanBeeEvent[];
  history: SearchEntry[];
}

const key = "planbee.workspace.v1";
const changeEvent = "planbee-workspace";
const empty: Workspace = { profile: { name: "", city: "", interests: [] }, saved: [], history: [] };
const initial = JSON.stringify(empty);
let memory: string | undefined;

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

function snapshot() {
  try { return memory ?? localStorage.getItem(key) ?? initial; } catch { return memory ?? initial; }
}

function decode(value: string): Workspace {
  try {
    const data = JSON.parse(value) as Partial<Workspace> | null;
    return {
      profile: { ...empty.profile, ...data?.profile },
      saved: Array.isArray(data?.saved) ? data.saved : [],
      history: Array.isArray(data?.history) ? data.history : [],
    };
  } catch { return empty; }
}

export function useWorkspace() {
  const value = useSyncExternalStore(subscribe, snapshot, () => initial);
  return useMemo(() => decode(value), [value]);
}

export function updateWorkspace(update: (current: Workspace) => Workspace) {
  const value = JSON.stringify(update(decode(snapshot())));
  try {
    localStorage.setItem(key, value);
    memory = undefined;
  } catch { memory = value; }
  window.dispatchEvent(new Event(changeEvent));
}
