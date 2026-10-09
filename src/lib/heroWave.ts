// src/lib/heroWave.ts — The particle wave behind a page hero.
// The worker in heroWave.worker.ts runs this renderer. The main thread runs it
// only when the browser cannot move a canvas to a worker.

export type WaveContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

// The wave draws with two colors. The split sets the share of each color.
// Zero gives about half of the particles to each color. A negative value
// gives more particles to the second color. A positive value gives fewer.
export interface WaveColors {
  first: string;
  second: string;
  split: number;
}

export interface WaveSize {
  width: number;
  height: number;
  titleBottom: number;
  compact: boolean;
}

export type WaveMessage =
  | { type: "init"; canvas: OffscreenCanvas; colors: WaveColors }
  | { type: "resize"; size: WaveSize }
  | { type: "run"; running: boolean }
  | { type: "still" };

export interface WaveSchedule {
  request: (callback: (time: number) => void) => number;
  cancel: (handle: number) => void;
}

// The wave moves slowly, so 30 frames each second look the same as 144.
// A fast monitor then does not multiply the work.
const FRAME_MS = 1000 / 30;
// A frame can arrive a little early. Accept it if it is this close.
const FRAME_SLACK_MS = 2;
const LEVELS = 24;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function createWave(
  context: WaveContext,
  colors: WaveColors,
  schedule: WaveSchedule,
) {
  let size: WaveSize = { width: 0, height: 0, titleBottom: 0, compact: false };
  let particles: {
    x: number;
    row: number;
    jitter: number;
    side: number;
  }[] = [];
  let elapsed = 0;
  let previousTime = 0;
  let frame = 0;
  let running = false;
  let shown = false;

  function draw() {
    const { width, height, titleBottom } = size;
    if (!width || !height) return;
    shown = true;
    context.clearRect(0, 0, width, height);
    const phase = elapsed * 0.00016;
    const buckets: number[][] = Array.from({ length: LEVELS * 2 }, () => []);

    for (const particle of particles) {
      const u = particle.x;
      const depth = particle.row;
      const x = u * width;
      const center =
        0.49 +
        Math.sin(u * Math.PI * 2 - 0.9 + phase) * 0.19 +
        Math.sin(u * Math.PI * 3.4 + phase * 0.6) * 0.045;
      const spread = 0.2 + Math.sin(u * Math.PI + phase * 0.4) * 0.06;
      const y =
        (center +
          depth * spread +
          Math.sin(u * 13 + depth * 3 + phase) * 0.022 +
          particle.jitter * 0.004) *
        height;
      const v = y / height;
      const edge =
        smooth(u / 0.13) *
        smooth((1 - u) / 0.13) *
        smooth(v / 0.22) *
        smooth((1 - v) / 0.25);
      const ribbon = 1 - smooth(Math.abs(depth));
      // Keep the brightest particles to the right of the title.
      const textDimming =
        y < titleBottom ? 0.55 + smooth((u - 0.65) / 0.3) * 0.45 : 0.8;
      const opacity = edge * (0.18 + ribbon * 0.62) * textDimming;
      const level = Math.round((opacity / 0.8) * (LEVELS - 1));
      if (!level) continue;
      const color =
        depth + Math.sin(u * 5 + phase * 0.3) * 0.35 > colors.split ? 1 : 0;
      const half = particle.side / 2;
      buckets[color * LEVELS + level].push(x - half, y - half, particle.side);
    }
    // Draw particles with shared colors and opacity in one operation.
    // A square of 1 to 3px looks the same as a circle and draws faster.
    for (let color = 0; color < 2; color++) {
      context.fillStyle = color ? colors.second : colors.first;
      for (let level = 1; level < LEVELS; level++) {
        const bucket = buckets[color * LEVELS + level];
        if (!bucket.length) continue;
        context.globalAlpha = (level / (LEVELS - 1)) * 0.8;
        context.beginPath();
        for (let i = 0; i < bucket.length; i += 3) {
          context.rect(bucket[i], bucket[i + 1], bucket[i + 2], bucket[i + 2]);
        }
        context.fill();
      }
    }
    context.globalAlpha = 1;
  }

  function tick(time: number) {
    frame = 0;
    if (!running) return;
    if (previousTime && time - previousTime < FRAME_MS - FRAME_SLACK_MS) {
      frame = schedule.request(tick);
      return;
    }
    elapsed += previousTime ? Math.min(time - previousTime, 100) : 0;
    previousTime = time;
    draw();
    frame = schedule.request(tick);
  }

  function resize(next: WaveSize) {
    size = next;
    // The grain look needs no high-density pixels. One canvas pixel for each
    // CSS pixel keeps the canvas small on a high-density screen.
    context.canvas.width = Math.round(next.width);
    context.canvas.height = Math.round(next.height);

    const rows = next.compact ? 38 : 40;
    const columns = Math.min(
      240,
      Math.ceil(next.width / (next.compact ? 5 : 7)),
    );
    particles = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const seed = Math.sin(row * 127.1 + column * 311.7) * 43758.5453;
        const jitter = seed - Math.floor(seed);
        const radius = 0.65 + jitter * 0.85;
        particles.push({
          x: (column + jitter * 0.65) / columns,
          row: (row / (rows - 1)) * 2 - 1,
          jitter: jitter - 0.5,
          // A square with this side has the area of the old circle.
          side: radius * Math.sqrt(Math.PI),
        });
      }
    }
    // A new size clears the canvas. Draw again if the wave is on the screen.
    if (shown) draw();
  }

  function run(next: boolean) {
    if (next === running) return;
    running = next;
    schedule.cancel(frame);
    frame = 0;
    previousTime = 0;
    if (running) frame = schedule.request(tick);
  }

  return { resize, run, still: draw };
}

export type Wave = ReturnType<typeof createWave>;
