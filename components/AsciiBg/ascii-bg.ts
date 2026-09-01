// <ascii-bg> — a zero-configuration animated ASCII field that fills its parent
// and sits behind the parent's content. No attributes, no props, no palette:
// it paints in whatever `currentColor` it inherits, so themes, dark mode and
// hover states drive it for free. The parent needs `position: relative` and
// `overflow: hidden`; anything that should sit above it needs `position`.
const RAMP = " .:-=+*#%@";
const CELL = 12;
const FRAME = 40; // ~24fps — chunkier, and a fraction of the work of 60

class AsciiBg extends HTMLElement {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private observer!: ResizeObserver;
  private still!: MediaQueryList;
  private onPointer!: (event: PointerEvent) => void;
  private onMotion = () => this.tick();
  private frame = 0;
  private stamp = 0;
  private cols = 0;
  private rows = 0;
  private width = 0;
  private height = 0;
  private pointer: [number, number] = [-1e4, -1e4];

  connectedCallback() {
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.innerHTML =
      "<style>:host{position:absolute;inset:0;overflow:hidden;pointer-events:none;color:inherit}" +
      "canvas{display:block;width:100%;height:100%}</style><canvas></canvas>";
    this.canvas = root.querySelector("canvas")!;
    this.ctx = this.canvas.getContext("2d")!;
    this.still = matchMedia("(prefers-reduced-motion: reduce)");
    // :host is pointer-events:none, so the pointer is tracked on the window and
    // mapped into local space.
    this.onPointer = (event) => {
      const box = this.getBoundingClientRect();
      this.pointer = [event.clientX - box.left, event.clientY - box.top];
    };
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    this.still.addEventListener("change", this.onMotion);
    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this);
    this.measure();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.still.removeEventListener("change", this.onMotion);
    window.removeEventListener("pointermove", this.onPointer);
  }

  private measure() {
    const dpr = devicePixelRatio || 1;
    const { width, height } = this.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    // Resizing the canvas resets the context, so the state goes back after.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.font = `${CELL}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    this.ctx.textBaseline = "top";
    this.cols = Math.ceil(width / CELL) + 1;
    this.rows = Math.ceil(height / CELL) + 1;
    this.tick();
  }

  // Under reduced motion the field is frozen, so one paint is the whole job and
  // the loop never starts.
  private tick = (now = 0) => {
    const frozen = this.still.matches;
    cancelAnimationFrame(this.frame);
    if (!frozen) this.frame = requestAnimationFrame(this.tick);
    if (!frozen && now - this.stamp < FRAME) return;
    this.stamp = now;
    this.paint(frozen ? 0 : now / 1000);
  };

  private paint(time: number) {
    const { ctx, cols, rows } = this;
    const [px, py] = this.still.matches ? [-1e4, -1e4] : this.pointer;
    ctx.clearRect(0, 0, this.width, this.height);
    // Re-read every paint: that is what makes a theme swap or a hover on the
    // parent recolour the field with no wiring at all.
    ctx.fillStyle = getComputedStyle(this).color;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * CELL;
        const y = row * CELL;
        const pull = 1.2 / (1 + Math.hypot(x - px, y - py) * 0.03);
        const wave =
          Math.sin(col * 0.26 + time * 0.9 + Math.sin(row * 0.19 - time * 0.6) * 1.6) +
          Math.sin(row * 0.31 - time * 0.7 + Math.cos(col * 0.15 + time * 0.4) * 1.3) +
          pull;
        const step = Math.round(((wave + 2) / 4) * (RAMP.length - 1));
        const glyph = RAMP[Math.min(RAMP.length - 1, Math.max(0, step))];
        if (glyph !== " ") ctx.fillText(glyph, x, y);
      }
    }
  }
}

if (!customElements.get("ascii-bg")) customElements.define("ascii-bg", AsciiBg);

// Side-effect import only; the empty export is what makes it a module.
export {};
