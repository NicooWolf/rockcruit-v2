// src/lib/heroWave.worker.ts — Draws the hero wave off the main thread.
// The main thread keeps the scroll and the reveal animations. A slow wave
// frame here cannot delay them.
import { createWave, type Wave, type WaveMessage } from "./heroWave";

// Some browsers give a worker no requestAnimationFrame. Use a timer there.
const schedule =
  typeof requestAnimationFrame === "function"
    ? {
        request: (callback: (time: number) => void) =>
          requestAnimationFrame(callback),
        cancel: (handle: number) => cancelAnimationFrame(handle),
      }
    : {
        request: (callback: (time: number) => void) =>
          self.setTimeout(() => callback(performance.now()), 1000 / 30),
        cancel: (handle: number) => self.clearTimeout(handle),
      };

let wave: Wave | undefined;

addEventListener("message", (event: MessageEvent<WaveMessage>) => {
  const message = event.data;
  if (message.type === "init") {
    const context = message.canvas.getContext("2d");
    if (context) wave = createWave(context, message.colors, schedule);
  } else if (message.type === "resize") {
    wave?.resize(message.size);
  } else if (message.type === "run") {
    wave?.run(message.running);
  } else {
    wave?.still();
  }
});
