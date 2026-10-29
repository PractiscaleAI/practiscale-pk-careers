import * as THREE from "three";

const SOURCE_WIDTH = 1142;
const SOURCE_HEIGHT = 1377;
const SCALE = 0.8;
const PLANE_WIDTH = 4.73;
const PLANE_HEIGHT = 5.7;
const FULL = { x: 0, y: 0, width: SOURCE_WIDTH, height: SOURCE_HEIGHT };
const HEAD = { x: 380, y: 28, width: 425, height: 360 };
const EYE_AREA = { x: 515, y: 160, width: 200, height: 128 };
const EYES = [
  { x: 564, y: 218, rx: 24, ry: 37 },
  { x: 675, y: 242, rx: 24, ry: 37 },
];

type Crop = typeof FULL;

function makeCanvas(crop: Crop) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width * SCALE);
  canvas.height = Math.round(crop.height * SCALE);
  return canvas;
}

function drawCrop(context: CanvasRenderingContext2D, image: HTMLImageElement, crop: Crop) {
  context.setTransform(SCALE, 0, 0, SCALE, -crop.x * SCALE, -crop.y * SCALE);
  context.drawImage(image, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
}

function placement(crop: Crop) {
  return {
    width: (crop.width / SOURCE_WIDTH) * PLANE_WIDTH,
    height: (crop.height / SOURCE_HEIGHT) * PLANE_HEIGHT,
    x: ((crop.x + crop.width / 2) / SOURCE_WIDTH - 0.5) * PLANE_WIDTH,
    y: (0.5 - (crop.y + crop.height / 2) / SOURCE_HEIGHT) * PLANE_HEIGHT,
  };
}

function headOutline() {
  const path = new Path2D();
  path.moveTo(558, 42);
  path.bezierCurveTo(668, 34, 749, 91, 767, 173);
  path.bezierCurveTo(786, 253, 744, 323, 683, 350);
  path.bezierCurveTo(631, 378, 514, 354, 457, 329);
  path.bezierCurveTo(403, 308, 386, 255, 393, 187);
  path.bezierCurveTo(402, 109, 462, 49, 558, 42);
  path.closePath();
  return path;
}

function textureFrom(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export function makeGuideLayers(image: HTMLImageElement) {
  const headPath = headOutline();
  const bodyCanvas = makeCanvas(FULL);
  const bodyContext = bodyCanvas.getContext("2d", { willReadFrequently: true });
  const headCanvas = makeCanvas(HEAD);
  const headContext = headCanvas.getContext("2d", { willReadFrequently: true });
  const eyesCanvas = makeCanvas(EYE_AREA);
  const eyesContext = eyesCanvas.getContext("2d", { willReadFrequently: true });
  if (!bodyContext || !headContext || !eyesContext) {
    throw new Error("The mascot canvas could not be created.");
  }

  drawCrop(bodyContext, image, FULL);
  bodyContext.globalCompositeOperation = "destination-out";
  bodyContext.fill(headPath);

  drawCrop(headContext, image, HEAD);
  headContext.globalCompositeOperation = "destination-in";
  headContext.fill(headPath);
  headContext.globalCompositeOperation = "source-over";

  // Reconstruct the small face areas behind the original eyes from the
  // neighboring face pixels. This avoids a visible duplicate when eyes move.
  const headPixels = headContext.getImageData(0, 0, headCanvas.width, headCanvas.height);
  const original = new Uint8ClampedArray(headPixels.data);
  const repaired = headPixels.data;
  for (const eye of EYES) {
    const centerX = (eye.x - HEAD.x) * SCALE;
    const centerY = (eye.y - HEAD.y) * SCALE;
    const radiusX = eye.rx * 1.55 * SCALE;
    const radiusY = eye.ry * 1.35 * SCALE;
    const left = Math.round(centerX - radiusX - 3);
    const right = Math.round(centerX + radiusX + 3);
    for (let y = Math.floor(centerY - radiusY); y <= centerY + radiusY; y++) {
      for (let x = Math.floor(centerX - radiusX); x <= centerX + radiusX; x++) {
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        const distance = Math.hypot(dx, dy);
        if (distance >= 1) continue;
        const weight = 1 - THREE.MathUtils.smoothstep(distance, 0.68, 1);
        const index = (y * headCanvas.width + x) * 4;
        const leftIndex = (y * headCanvas.width + left) * 4;
        const rightIndex = (y * headCanvas.width + right) * 4;
        const mix = (x - left) / (right - left);
        for (let channel = 0; channel < 3; channel++) {
          const face = original[leftIndex + channel] * (1 - mix) +
            original[rightIndex + channel] * mix;
          repaired[index + channel] = Math.round(
            original[index + channel] * (1 - weight) + face * weight,
          );
        }
      }
    }
  }
  headContext.putImageData(headPixels, 0, 0);

  drawCrop(eyesContext, image, EYE_AREA);
  const pixels = eyesContext.getImageData(0, 0, eyesCanvas.width, eyesCanvas.height);
  const data = pixels.data;
  for (let y = 0; y < eyesCanvas.height; y++) {
    for (let x = 0; x < eyesCanvas.width; x++) {
      const index = (y * eyesCanvas.width + x) * 4;
      const inside = EYES.some((eye) => {
        const dx = (x / SCALE + EYE_AREA.x - eye.x) / (eye.rx * 1.8);
        const dy = (y / SCALE + EYE_AREA.y - eye.y) / (eye.ry * 1.35);
        return dx * dx + dy * dy < 1;
      });
      if (!inside) {
        data[index + 3] = 0;
        continue;
      }
      const green = data[index + 1];
      const red = data[index];
      const glow = Math.min(1, Math.max(0, (green - 62) / 90));
      data[index + 3] = Math.round(data[index + 3] * glow * (green > red * 1.25 ? 1 : 0));
    }
  }
  eyesContext.putImageData(pixels, 0, 0);

  return {
    body: textureFrom(bodyCanvas),
    head: textureFrom(headCanvas),
    eyes: textureFrom(eyesCanvas),
    bodyPlacement: placement(FULL),
    headPlacement: placement(HEAD),
    eyePlacement: placement(EYE_AREA),
  };
}
