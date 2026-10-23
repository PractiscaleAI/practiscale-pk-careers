"use client";
import { useEffect, useRef } from "react";
import { proofMetrics, proofActiveIndex } from "@/lib/proof-content";

declare global {
  interface Window {
    __proofExport?: {
      frame: (p: number, variant?: string) => string;
      poster: (variant?: string) => string;
      laptopPoster: (variant?: string) => Promise<string>;
      info: () => unknown;
    };
    __proofExportError?: string;
  }
}

export default function ProofRender() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current!;
    let disposed = false;
    let world:
      | Awaited<
          ReturnType<
            (typeof import("@/lib/proof-world/scene.js"))["createProofWorld"]
          >
        >
      | undefined;
    let laptop:
      | Awaited<
          ReturnType<
            (typeof import("@/lib/earnings-laptop/scene.js"))["createLaptop"]
          >
        >
      | undefined;
    const output = document.createElement("canvas");
    let dimensions = "";
    async function initialize() {
      try {
        await Promise.all([
          document.fonts.load("600 72px Sora"),
          document.fonts.load("400 32px Manrope"),
          document.fonts.load('400 24px "JetBrains Mono"'),
        ]);
        const { createProofWorld, proofPalette } =
          await import("@/lib/proof-world/scene.js");
        if (disposed) return;
        world = await createProofWorld(host, {
          exporting: true,
          dpr: 1,
          width: 1800,
          height: 780,
          palette: proofPalette(host),
        });
        if (disposed) {
          world.dispose();
          return;
        }
        function size(w: number, h: number, mobile: boolean) {
          const next = `${w}:${h}:${mobile}`;
          if (dimensions !== next) {
            world!.resize(w, h, mobile);
            dimensions = next;
          }
        }
        function wrap(
          ctx: CanvasRenderingContext2D,
          text: string,
          x: number,
          y: number,
          maxWidth: number,
          lineHeight: number,
        ) {
          let line = "";
          for (const word of text.split(" ")) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width > maxWidth && line) {
              ctx.fillText(line, x, y);
              line = word;
              y += lineHeight;
            } else line = next;
          }
          ctx.fillText(line, x, y);
        }
        window.__proofExport = {
          frame(p, variant = "desktop") {
            const mobile = variant === "mobile",
              w = mobile ? 1080 : 1920,
              h = mobile ? 1920 : 1080;
            output.width = w;
            output.height = h;
            const ctx = output.getContext("2d")!;
            ctx.fillStyle = "#134143";
            ctx.fillRect(0, 0, w, h);
            size(mobile ? 1000 : 1800, mobile ? 800 : 780, mobile);
            world!.render(p, true);
            ctx.drawImage(world!.canvas, mobile ? 40 : 60, mobile ? 120 : 12);
            ctx.fillStyle = "#BDD3D3";
            ctx.font = `400 ${mobile ? 28 : 24}px "JetBrains Mono"`;
            ctx.fillText(
              "PRACTISCALE / PROOF",
              mobile ? 90 : 120,
              mobile ? 90 : 58,
            );
            const active = proofActiveIndex(p);
            proofMetrics.forEach((metric, i) => {
              const column = mobile ? i % 2 : i,
                row = mobile && i >= 2 ? 1 : 0;
              const x = mobile ? 90 + column * 500 : 120 + i * 435,
                y = mobile ? 1120 + row * 290 : 880;
              ctx.strokeStyle = "#3D7375";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x, y - 45);
              ctx.lineTo(x + (mobile ? 400 : 370), y - 45);
              ctx.stroke();
              if (active === i) {
                ctx.fillStyle = "#F5B041";
                ctx.fillRect(x, y - 46, 60, 4);
              }
              ctx.fillStyle = "#FFFFFF";
              ctx.font = `600 ${mobile ? 94 : 76}px Sora`;
              ctx.fillText(metric.value, x, y + 42);
              ctx.fillStyle = "#BDD3D3";
              ctx.font = `400 ${mobile ? 34 : 28}px Manrope`;
              wrap(
                ctx,
                metric.label,
                x,
                y + (mobile ? 106 : 94),
                mobile ? 400 : 365,
                mobile ? 46 : 39,
              );
            });
            return output.toDataURL("image/png");
          },
          poster(variant = "desktop") {
            const mobile = variant === "mobile";
            size(mobile ? 900 : 1440, mobile ? 800 : 680, mobile);
            world!.render(1, true);
            return world!.canvas.toDataURL("image/webp", 0.93);
          },
          async laptopPoster(variant = "desktop") {
            if (!laptop) {
              const { createLaptop } =
                await import("@/lib/earnings-laptop/scene.js");
              laptop = await createLaptop(host, () => {});
            }
            if (!laptop) throw Error("Laptop renderer unavailable");
            const { storyAt } =
              await import("@/lib/earnings-laptop/earnings-data.js");
            laptop.resize(variant === "mobile");
            laptop.render(storyAt(0, true), true);
            const b = JSON.parse(laptop.canvas.dataset.modelBounds!);
            const ratio =
              laptop.canvas.width / (variant === "mobile" ? 620 : 1200);
            const padding = 32;
            const left = Math.max(0, b.left - padding),
              top = Math.max(0, b.top - padding);
            const width = Math.min(
              laptop.canvas.width / ratio - left,
              b.right - b.left + padding * 2,
            );
            const height = Math.min(
              laptop.canvas.height / ratio - top,
              b.bottom - b.top + padding * 2,
            );
            const poster = document.createElement("canvas");
            poster.width = Math.round(width * ratio);
            poster.height = Math.round(height * ratio);
            poster
              .getContext("2d")!
              .drawImage(
                laptop.canvas,
                left * ratio,
                top * ratio,
                width * ratio,
                height * ratio,
                0,
                0,
                poster.width,
                poster.height,
              );
            return poster.toDataURL("image/webp", 0.93);
          },
          info: () => ({
            drawCalls: world!.canvas.dataset.drawCalls,
            instances: world!.canvas.dataset.instances,
            renderMs: world!.canvas.dataset.renderMs,
          }),
        };
      } catch (error) {
        window.__proofExportError = String(error);
      }
    }
    void initialize();
    return () => {
      disposed = true;
      delete window.__proofExport;
      world?.dispose();
      laptop?.dispose();
    };
  }, []);
  return (
    <main
      id="main"
      style={{ background: "var(--deep)", minHeight: "100svh", padding: 24 }}
    >
      <h1 className="sr-only">Proof animation export workspace</h1>
      <div
        ref={ref}
        data-proof-export-host
        style={{ width: "100%", height: "80svh" }}
      />
    </main>
  );
}
