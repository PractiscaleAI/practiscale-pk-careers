import * as THREE from "three";

const SOURCE_WIDTH = 1142;
const SOURCE_HEIGHT = 1377;
const SCALE = 0.8;
const PLANE_WIDTH = 4.73;
const PLANE_HEIGHT = 5.7;
const FULL = { x: 0, y: 0, width: SOURCE_WIDTH, height: SOURCE_HEIGHT };
const HEAD = { x: 380, y: 28, width: 425, height: 360 };
const VISOR = { x: 468, y: 96, width: 284, height: 238 };
const EYE_AREA = { x: 505, y: 150, width: 235, height: 160 };
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

function drawCrop(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  crop: Crop,
) {
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

function visorInterior() {
  // Stay inside the white rim, which remains on the head layer.
  const path = new Path2D();
  path.moveTo(543, 113);
  path.bezierCurveTo(602, 101, 685, 130, 718, 174);
  path.bezierCurveTo(746, 215, 720, 293, 678, 317);
  path.bezierCurveTo(623, 331, 529, 297, 495, 266);
  path.bezierCurveTo(469, 239, 482, 137, 543, 113);
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
  const visorCanvas = makeCanvas(VISOR);
  const visorContext = visorCanvas.getContext("2d");
  const eyesCanvas = makeCanvas(EYE_AREA);
  const eyesContext = eyesCanvas.getContext("2d", { willReadFrequently: true });
  if (!bodyContext || !headContext || !visorContext || !eyesContext) {
    throw new Error("The mascot canvas could not be created.");
  }

  drawCrop(bodyContext, image, FULL);
  bodyContext.globalCompositeOperation = "destination-out";
  bodyContext.save();
  bodyContext.beginPath();
  bodyContext.moveTo(0, 0);
  bodyContext.lineTo(SOURCE_WIDTH, 0);
  bodyContext.lineTo(SOURCE_WIDTH, 380);
  bodyContext.lineTo(650, 380);
  bodyContext.lineTo(610, 315);
  bodyContext.lineTo(0, 315);
  bodyContext.closePath();
  bodyContext.clip();
  bodyContext.fill(headPath);
  bodyContext.restore();
  // Keep the photographed neck instead of painting an artificial bridge.

  drawCrop(headContext, image, HEAD);
  headContext.globalCompositeOperation = "destination-in";
  headContext.fill(headPath);
  headContext.globalCompositeOperation = "source-over";

  // The source has eye shadows baked into its visor. A clean shaded surface
  // behind the separately moving eyes avoids leaving those shadows behind.
  // Keep the original helmet shell, rim and extracted luminous eyes intact.
  visorContext.setTransform(
    SCALE,
    0,
    0,
    SCALE,
    -VISOR.x * SCALE,
    -VISOR.y * SCALE,
  );
  visorContext.save();
  visorContext.clip(visorInterior());
  const faceShade = visorContext.createLinearGradient(565, 100, 620, 330);
  faceShade.addColorStop(0, "#0a6470");
  faceShade.addColorStop(0.48, "#00545a");
  faceShade.addColorStop(1, "#003e42");
  visorContext.fillStyle = faceShade;
  visorContext.fillRect(VISOR.x, VISOR.y, VISOR.width, VISOR.height);
  const faceLight = visorContext.createRadialGradient(
    644,
    143,
    4,
    641,
    153,
    150,
  );
  faceLight.addColorStop(0, "rgba(112, 184, 196, 0.54)");
  faceLight.addColorStop(0.55, "rgba(56, 139, 151, 0.18)");
  faceLight.addColorStop(1, "rgba(3, 80, 87, 0)");
  visorContext.fillStyle = faceLight;
  visorContext.fillRect(VISOR.x, VISOR.y, VISOR.width, VISOR.height);
  visorContext.restore();

  // Remove the duplicate face from the shell. Only the single movable visor
  // carries the face gradient, with a dark safety backing beneath its edges.
  headContext.save();
  headContext.fillStyle = "#073f43";
  headContext.fill(visorInterior());
  headContext.restore();

  drawCrop(eyesContext, image, EYE_AREA);
  const pixels = eyesContext.getImageData(
    0,
    0,
    eyesCanvas.width,
    eyesCanvas.height,
  );
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
      const blue = data[index + 2];
      // The teal visor is bright enough to pass a plain green threshold.
      // Mint eye light has both greater brightness and a green-blue split.
      const glow =
        THREE.MathUtils.smoothstep(green, 130, 215) *
        THREE.MathUtils.smoothstep(green - blue, 5, 30);
      data[index + 3] = Math.round(
        data[index + 3] * glow * (green > red * 1.25 ? 1 : 0),
      );
    }
  }
  eyesContext.putImageData(pixels, 0, 0);

  return {
    body: textureFrom(bodyCanvas),
    head: textureFrom(headCanvas),
    visor: textureFrom(visorCanvas),
    eyes: textureFrom(eyesCanvas),
    bodyPlacement: placement(FULL),
    headPlacement: placement(HEAD),
    visorPlacement: placement(VISOR),
    eyePlacement: placement(EYE_AREA),
    neckPivot: {
      x: (570 / SOURCE_WIDTH - 0.5) * PLANE_WIDTH,
      y: (0.5 - 348 / SOURCE_HEIGHT) * PLANE_HEIGHT,
    },
  };
}
