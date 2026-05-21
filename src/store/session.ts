import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoachReport, Focus, SessionState, Story } from "@/types";

interface Store {
  sessions: Record<string, SessionState>;
  reports: Record<string, CoachReport>;
  stories: Record<string, Story>;
  createSession: (opts: { role: string; background: string; focus: Focus; interview_mode?: "behavioral" | "technical" | "system_design" }) => string;
  updateSession: (id: string, patch: Partial<SessionState>) => void;
  appendTurn: (id: string, turn: SessionState["turns"][number]) => void;
  setReport: (id: string, report: CoachReport) => void;
  addStory: (story: Story) => void;
  removeStory: (id: string) => void;
  remove: (id: string) => void;
}

export const useSessionStore = create<Store>()(
  persist(
    (set) => ({
      sessions: {},
      reports: {},
      stories: {},
      createSession: ({ role, background, focus, interview_mode }) => {
        const id = crypto.randomUUID().slice(0, 8);
        const state: SessionState = {
          id,
          role,
          background,
          focus,
          interview_mode,
          turn: 0,
          maxTurns: 6,
          difficulty: 0.5,
          turns: [],
          complete: false,
          createdAt: Date.now(),
        };
        set((s) => ({ sessions: { ...s.sessions, [id]: state } }));
        return id;
      },
      updateSession: (id, patch) =>
        set((s) => ({ sessions: { ...s.sessions, [id]: { ...s.sessions[id], ...patch } } })),
      appendTurn: (id, turn) =>
        set((s) => ({
          sessions: {
            ...s.sessions,
            [id]: { ...s.sessions[id], turns: [...s.sessions[id].turns, turn] },
          },
        })),
      setReport: (id, report) => set((s) => ({ reports: { ...s.reports, [id]: report } })),
      addStory: (story) => set((s) => ({ stories: { ...s.stories, [story.id]: story } })),
      removeStory: (id) => set((s) => {
        const { [id]: _s, ...stories } = s.stories;
        return { stories };
      }),
      remove: (id) =>
        set((s) => {
          const { [id]: _s, ...sessions } = s.sessions;
          const { [id]: _r, ...reports } = s.reports;
          return { sessions, reports };
        }),
    }),
    { name: "aria-sessions" },
  ),
);
