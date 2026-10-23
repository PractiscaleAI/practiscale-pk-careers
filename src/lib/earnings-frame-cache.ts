/** Only a small window is decoded; the browser caches the compressed WebP files. */
export class EarningsFrameCache {
  private images = new Map<number, ImageBitmap>();
  private pending = new Map<number, AbortController>();
  private retries = new Map<number, number>();
  private failed = new Set<number>();
  private queue: number[] = [];
  private target = -1;
  private direction = 1;
  private disposed = false;

  constructor(
    private base: string,
    readonly limit: number,
    private changed: () => void,
    private failedTarget: () => void,
  ) {}

  get size() {
    return this.images.size;
  }
  get inFlight() {
    return this.pending.size;
  }
  get(index: number) {
    return this.images.get(index);
  }
  nearest(index: number, maxGap = 8) {
    let nearest: number | undefined;
    for (const key of this.images.keys()) {
      if (
        Math.abs(key - index) <= maxGap &&
        (nearest === undefined ||
          Math.abs(key - index) < Math.abs(nearest - index))
      )
        nearest = key;
    }
    return nearest === undefined
      ? undefined
      : { index: nearest, image: this.images.get(nearest)! };
  }

  seek(index: number, direction: number) {
    if (this.disposed) return;
    this.target = index;
    this.direction = direction || 1;
    if (this.failed.has(index)) {
      this.failedTarget();
      return;
    }
    // Remove aborted requests immediately so a rapid reversal can request them again.
    for (const [frame, controller] of this.pending) {
      if (Math.abs(frame - index) > 24) {
        controller.abort();
        this.pending.delete(frame);
      }
    }
    this.plan();
    this.evict();
    this.pump();
  }

  private plan() {
    const wanted = [this.target];
    for (let distance = 1; wanted.length < this.limit; distance++) {
      wanted.push(this.target + distance * this.direction);
      if (wanted.length < this.limit)
        wanted.push(this.target - distance * this.direction);
    }
    this.queue = wanted.filter(
      (index) =>
        index >= 0 &&
        index < 600 &&
        !this.images.has(index) &&
        !this.pending.has(index) &&
        !this.failed.has(index),
    );
  }

  private evict() {
    while (this.images.size > this.limit) {
      const furthest = [...this.images.keys()].sort(
        (a, b) => Math.abs(b - this.target) - Math.abs(a - this.target),
      )[0];
      this.images.get(furthest)?.close();
      this.images.delete(furthest);
    }
  }

  private pump() {
    while (!this.disposed && this.pending.size < 3 && this.queue.length) {
      const index = this.queue.shift()!;
      if (
        this.pending.has(index) ||
        this.images.has(index) ||
        this.failed.has(index)
      )
        continue;
      const controller = new AbortController();
      this.pending.set(index, controller);
      const timeout = setTimeout(() => controller.abort("timeout"), 8000);
      fetch(`${this.base}/frame-${String(index).padStart(4, "0")}.webp`, {
        signal: controller.signal,
        cache: "force-cache",
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Frame HTTP ${response.status}`);
          return response.blob();
        })
        .then((blob) => createImageBitmap(blob))
        .then((bitmap) => {
          if (this.disposed || controller.signal.aborted) bitmap.close();
          else {
            this.images.set(index, bitmap);
            this.evict();
            this.changed();
          }
        })
        .catch(() => {
          if (
            this.disposed ||
            (controller.signal.aborted &&
              controller.signal.reason !== "timeout")
          )
            return;
          const attempts = (this.retries.get(index) || 0) + 1;
          this.retries.set(index, attempts);
          if (attempts < 2 && Math.abs(index - this.target) < 12)
            this.queue.unshift(index);
          else {
            this.failed.add(index);
            if (index === this.target) this.failedTarget();
          }
        })
        .finally(() => {
          clearTimeout(timeout);
          // An old aborted request must not delete its replacement after a reversal.
          if (this.pending.get(index) === controller)
            this.pending.delete(index);
          this.pump();
        });
    }
  }

  dispose() {
    this.disposed = true;
    this.queue = [];
    for (const controller of this.pending.values()) controller.abort();
    this.pending.clear();
    for (const image of this.images.values()) image.close();
    this.images.clear();
  }
}
