import { create } from "zustand";

interface QueueState {
  isQueueOpen: boolean;
  toggleQueue: () => void;
  setQueueOpen: (isOpen: boolean) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  isQueueOpen: false,
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
  setQueueOpen: (isOpen) => set({ isQueueOpen: isOpen }),
}));
