import { create } from "zustand";
import { persist } from "zustand/middleware";
import { audioController } from "../lib/audioController";

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  streamUrl?: string;
  album?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  queue: Track[];
  queueIndex: number;
  shuffleEnabled: boolean;
  repeatMode: "off" | "one" | "all";
  playHistory: Track[];
  
  play: (track?: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setQueueIndex: (index: number) => void;

  isNowPlayingWindowOpen: boolean;
  toggleNowPlayingWindow: () => void;
  openNowPlayingWindow: () => void;
  closeNowPlayingWindow: () => void;
  autoPlaySimilar: boolean;
  toggleAutoPlaySimilar: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      isLoading: false,
      queue: [],
      queueIndex: -1,
      shuffleEnabled: false,
      repeatMode: "off",
      playHistory: [],

      play: (track) => {
        const { queue, queueIndex } = get();
        
        let trackToPlay = track;
        let newIndex = queueIndex;
        
        if (!trackToPlay) {
          if (queue.length > 0 && queueIndex >= 0 && queueIndex < queue.length) {
            trackToPlay = queue[queueIndex];
            newIndex = queueIndex;
          } else if (queue.length > 0) {
            trackToPlay = queue[0];
            newIndex = 0;
          } else {
            return;
          }
        } else {
          const existingIndex = queue.findIndex(t => t.id === trackToPlay!.id);
          if (existingIndex >= 0) {
            newIndex = existingIndex;
          } else {
            set({ queue: [trackToPlay, ...queue], queueIndex: 0 });
            newIndex = 0;
          }
        }

        set({ 
          isLoading: true, 
          currentTrack: trackToPlay,
          queueIndex: newIndex,
          currentTime: 0,
          duration: trackToPlay.duration || 0,
          playHistory: [trackToPlay, ...get().playHistory.filter(t => t.id !== trackToPlay!.id)].slice(0, 50)
        });

        audioController.loadAndPlay(trackToPlay.id);
      },

      pause: () => {
        audioController.pause();
        set({ isPlaying: false });
      },

      resume: () => {
        audioController.play();
        set({ isPlaying: true });
      },

      next: () => {
        const { queue, queueIndex, shuffleEnabled, repeatMode, play } = get();
        if (queue.length === 0) return;

        let nextIndex: number;
        if (shuffleEnabled) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = queueIndex + 1;
        }

        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            audioController.pause();
            set({ isPlaying: false, currentTime: 0 });
            return;
          }
        }

        set({ queueIndex: nextIndex });
        play(queue[nextIndex]);
      },

      previous: () => {
        const { queue, queueIndex, currentTime, play } = get();
        
        if (currentTime > 3) {
          get().seek(0);
          return;
        }

        if (queue.length === 0) return;

        let prevIndex = queueIndex - 1;
        if (prevIndex < 0) prevIndex = queue.length - 1;

        set({ queueIndex: prevIndex });
        play(queue[prevIndex]);
      },

      seek: (time) => {
        audioController.seek(time);
        set({ currentTime: time });
      },

      setVolume: (vol) => {
        audioController.setVolume(vol);
        set({ volume: vol, isMuted: false });
      },

      toggleMute: () => {
        const newMuted = !get().isMuted;
        audioController.setMute(newMuted);
        set({ isMuted: newMuted });
      },

      addToQueue: (track) => {
        const { queue } = get();
        if (!queue.some(t => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },

      removeFromQueue: (index) => {
        const { queue, queueIndex } = get();
        const newQueue = [...queue];
        newQueue.splice(index, 1);
        
        let newIndex = queueIndex;
        if (index < queueIndex) {
          newIndex--;
        }
        
        set({ queue: newQueue, queueIndex: newIndex });
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      toggleShuffle: () => {
        set((state) => ({ shuffleEnabled: !state.shuffleEnabled }));
      },

      toggleRepeat: () => {
        set((state) => {
          const modes: ("off" | "one" | "all")[] = ["off", "all", "one"];
          const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
          return { repeatMode: modes[nextIndex] };
        });
      },

      setCurrentTime: (time: number) => set({ currentTime: time }),
      setDuration: (dur: number) => set({ duration: dur }),
      setQueueIndex: (index: number) => set({ queueIndex: index }),

      isNowPlayingWindowOpen: false,
      autoPlaySimilar: true,
      openNowPlayingWindow: () => set({ isNowPlayingWindowOpen: true }),
      closeNowPlayingWindow: () => set({ isNowPlayingWindowOpen: false }),
      toggleNowPlayingWindow: () => set((s) => ({ isNowPlayingWindowOpen: !s.isNowPlayingWindowOpen })),
      toggleAutoPlaySimilar: () => set((s) => ({ autoPlaySimilar: !s.autoPlaySimilar })),
    }),
    {
      name: 'dhun-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted, 
        repeatMode: state.repeatMode, 
        shuffleEnabled: state.shuffleEnabled,
        currentTrack: state.currentTrack,
        queue: state.queue
      }),
    }
  )
);
