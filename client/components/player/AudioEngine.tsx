"use client";

import { useEffect } from "react";
import { audioController } from "../../lib/audioController";

export default function AudioEngine() {
  useEffect(() => {
    audioController.init();
    // Try creating player once DOM element is ready
    const timer = setTimeout(() => {
      audioController.createPlayer();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed bottom-2 right-2 w-16 h-16 pointer-events-none rounded-lg overflow-hidden z-0 opacity-[0.01]"
      aria-hidden="true"
    >
      <div id="dhun-yt-player" className="w-full h-full" />
    </div>
  );
}
