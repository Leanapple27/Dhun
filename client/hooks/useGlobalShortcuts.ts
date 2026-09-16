"use client";

import { useEffect } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { audioController } from "../lib/audioController";

interface SpeedDialSlot {
  slot: number;
  track: any;
}

export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never hijack keystrokes if the user is typing in any input, textarea, or editable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const store = usePlayerStore.getState();

      // 1-9: Speed Dial instant play
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const saved = localStorage.getItem("dhun_speed_dial");
        if (saved) {
          try {
            const slots: SpeedDialSlot[] = JSON.parse(saved);
            const match = slots.find((s) => s.slot === num);
            if (match?.track) {
              e.preventDefault();
              store.play(match.track);
              return;
            }
          } catch {}
        }
      }

      // Space: Toggle Play / Pause
      if (e.code === "Space") {
        e.preventDefault();
        if (store.isPlaying) {
          store.pause();
        } else {
          store.resume();
        }
        return;
      }

      // ArrowRight: Seek forward 5s
      if (e.code === "ArrowRight") {
        e.preventDefault();
        const newTime = Math.min(store.duration, store.currentTime + 5);
        store.seek(newTime);
        return;
      }

      // ArrowLeft: Seek backward 5s
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        const newTime = Math.max(0, store.currentTime - 5);
        store.seek(newTime);
        return;
      }

      // ArrowUp: Volume + 5%
      if (e.code === "ArrowUp") {
        e.preventDefault();
        store.setVolume(Math.min(1, store.volume + 0.05));
        return;
      }

      // ArrowDown: Volume - 5%
      if (e.code === "ArrowDown") {
        e.preventDefault();
        store.setVolume(Math.max(0, store.volume - 0.05));
        return;
      }

      // KeyM: Toggle Mute
      if (e.code === "KeyM") {
        e.preventDefault();
        store.toggleMute();
        return;
      }

      // KeyN: Next Track
      if (e.code === "KeyN") {
        e.preventDefault();
        store.next();
        return;
      }

      // KeyP: Previous Track
      if (e.code === "KeyP") {
        e.preventDefault();
        store.previous();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
