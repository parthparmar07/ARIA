import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InterviewLoop } from "@/types";

interface LoopState {
  loops: Record<string, InterviewLoop>;
  activeLoopId: string | null;
  addLoop: (loop: InterviewLoop) => void;
  updateLoop: (id: string, updates: Partial<InterviewLoop>) => void;
  setActiveLoop: (id: string | null) => void;
  removeLoop: (id: string) => void;
}

export const useLoopStore = create<LoopState>()(
  persist(
    (set) => ({
      loops: {},
      activeLoopId: null,
      addLoop: (loop) => set((s) => ({ loops: { ...s.loops, [loop.id]: loop } })),
      updateLoop: (id, updates) => set((s) => ({
        loops: {
          ...s.loops,
          [id]: { ...s.loops[id], ...updates }
        }
      })),
      setActiveLoop: (id) => set({ activeLoopId: id }),
      removeLoop: (id) => set((s) => {
        const newLoops = { ...s.loops };
        delete newLoops[id];
        return { 
          loops: newLoops,
          activeLoopId: s.activeLoopId === id ? null : s.activeLoopId
        };
      }),
    }),
    {
      name: "aria-loops-storage",
    }
  )
);
