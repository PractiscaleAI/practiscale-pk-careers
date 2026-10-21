import * as THREE from "three";
import {
  createCareerParticles,
  teamNodes,
  teamLinks,
  sampleTeamLink,
} from "@/lib/career-particles";
import { smooth, type CareerFrame } from "@/lib/career-content";
import type { CareerBrain } from "@/lib/career-brain";

const vertexShader = `
attribute vec3 aTarget0;
attribute vec3 aTarget1;
attribute vec3 aNormal0;
attribute vec3 aNormal1;
attribute vec3 aScatter;
attribute vec3 aTeamStyle;
attribute vec4 aSeed;
attribute vec3 aBary;
uniform float uMorph;
uniform float uDispersion;
uniform float uTime;
uniform float uGlyphScale;
varying vec3 vBary;
varying float vOutline;
varying float vTint;
varying float vLight;
varying float vDepth;
varying float vFacing;
varying vec3 vTeamStyle;
void main() {
  vec3 center=mix(aTarget0,aTarget1,uMorph);
  center=mix(center,aScatter,uDispersion*.72);
  vOutline=step(mix(.1,.18,uMorph),aSeed.z);
  float size=mix(mix(.022,.037,aSeed.x)*uGlyphScale,mix(.026,.049,aSeed.x),uMorph);
  size*=mix(1.,aTeamStyle.z,uMorph);
  float spin=aSeed.y*6.283185+uMorph*.4;
  vec3 local=position*size;
  local.xy=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*local.xy;
  vec3 normal=normalize(mix(aNormal0,aNormal1,uMorph));
  vec3 tangent=normalize(cross(abs(normal.y)>.9?vec3(1.,0.,0.):vec3(0.,1.,0.),normal));
  vec3 bitangent=cross(normal,tangent);
  float lift=.018*mix(1.,mix(.65,.25,aTeamStyle.y),uMorph);
  local=tangent*local.x+bitangent*local.y+normal*lift;
  center+=vec3(sin(uTime*.3+aSeed.x*9.0),cos(uTime*.25+aSeed.y*9.0),0.0)*.002;
  vec4 mv=modelViewMatrix*vec4(center+local,1.0);
  gl_Position=projectionMatrix*mv;
  vBary=aBary;
  vTeamStyle=aTeamStyle;
  vTint=.5+.5*sin(aTarget0.y*2.8+aTarget0.x*2.0+aTarget0.z*1.2);
  vec3 surfaceNormal=normalize(normalMatrix*mix(aNormal0,aNormal1,uMorph));
  float key=max(0.0,dot(surfaceNormal,normalize(vec3(-.65,.8,.75))));
  float fill=max(0.0,dot(surfaceNormal,normalize(vec3(.75,.15,.9))));
  vLight=mix(.16+.64*key+.2*fill,.08+.92*key,uMorph);
  vFacing=surfaceNormal.z;
  vDepth=clamp((cameraPosition.z+mv.z+2.5)/4.0,.4,1.0);
}`;

const fragmentShader = `
uniform vec3 uMint;
uniform vec3 uRaised;
uniform vec3 uFog;
uniform vec3 uBlue;
uniform vec3 uGrowth;
uniform vec4 uViewport;
uniform float uDpr;
uniform float uMorph;
varying vec3 vBary;
varying float vOutline;
varying float vTint;
varying float vLight;
varying float vDepth;
varying float vFacing;
varying vec3 vTeamStyle;
void main() {
  vec2 pixel=gl_FragCoord.xy/uDpr-uViewport.xy;
  vec2 q=abs(pixel-uViewport.zw*.5)-(uViewport.zw*.5-24.0);
  float rounded=length(max(q,0.0))+min(max(q.x,q.y),0.0)-24.0;
  if(rounded>.75) discard;
  float alpha=.92;
  if(vOutline>.5){
    vec3 edge=smoothstep(vec3(0.0),fwidth(vBary)*mix(.8,.9,uMorph),vBary);
    alpha=(1.0-min(min(edge.x,edge.y),edge.z))*.92;
    if(alpha<.02) discard;
  }
  vec3 color=mix(uBlue*1.8,uGrowth*1.08,smoothstep(.15,.45,vTint));
  color=mix(color,uMint,smoothstep(.5,.72,vTint));
  color=mix(color,uFog,smoothstep(.88,1.,vTint)*.9);
  vec3 brainColor=color*mix(.7,1.05,vLight);
  vec3 teamColor=uGrowth;
  if(vTeamStyle.x>.26) teamColor=mix(uBlue,uFog,.45);
  if(vTeamStyle.x>.53) teamColor=uMint;
  if(vTeamStyle.x>.79) teamColor=uFog;
  teamColor=mix(uRaised,teamColor,.28+vLight*.72);
  color=mix(brainColor,teamColor,uMorph);
  float facing=.65+.35*smoothstep(-.1,.6,vFacing);
  float linkAlpha=mix(1.,.78,uMorph*vTeamStyle.y);
  float brainAlpha=mix(.84,1.,vLight);
  gl_FragColor=vec4(color,alpha*(.9+vDepth*.1)*mix(brainAlpha,.82+vLight*.18,uMorph)*facing*linkAlpha);
  #include <colorspace_fragment>
}`;

// A quiet surface beneath the glyphs reveals the actual cortical folds.
// It shares the original mesh and camera, and fades before the particle morph.
const cortexVertexShader = `
varying vec3 vNormal;
void main() {
  vNormal=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;
const cortexFragmentShader = `
uniform vec3 uDeep;
uniform vec3 uSurface;
uniform vec3 uMint;
uniform float uPresence;
varying vec3 vNormal;
void main() {
  vec3 n=normalize(vNormal);
  float key=max(0.0,dot(n,normalize(vec3(-.55,.7,.9))));
  float rim=pow(1.0-abs(n.z),2.5);
  vec3 color=mix(uDeep*.62,uSurface,.12+key*.62);
  color=mix(color,uMint,rim*.045);
  gl_FragColor=vec4(mix(uDeep,color,uPresence*.86),1.0);
  #include <colorspace_fragment>
}`;

function createTeamDepthGeometry() {
  const positions: number[] = [],
    indices: number[] = [];
  for (const node of teamNodes) {
    const sphere = new THREE.SphereGeometry(node.radius, 24, 16);
    sphere.translate(...node.position);
    const offset = positions.length / 3;
    positions.push(...sphere.getAttribute("position").array);
    indices.push(...Array.from(sphere.index!.array, (index) => index + offset));
    sphere.dispose();
  }
  const segments = 40,
    sides = 8;
  teamLinks.forEach((_, link) => {
    const offset = positions.length / 3;
    for (let t = 0; t <= segments; t++)
      for (let side = 0; side <= sides; side++)
        positions.push(
          ...sampleTeamLink(link, t / segments, (side / sides) * Math.PI * 2)
            .point,
        );
    for (let t = 0; t < segments; t++)
      for (let side = 0; side < sides; side++) {
        const a = offset + t * (sides + 1) + side,
          b = a + sides + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  return geometry;
}

export type CareerWorld = {
  update: (frame: CareerFrame) => void;
  setActive: (active: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

export function createCareerWorld(
  host: HTMLElement,
  brain: CareerBrain,
  onFailure: () => void,
): CareerWorld {
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const count = memory <= 4 ? 6800 : 10000;
  const data = createCareerParticles(count, brain);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 1024 ? 1.25 : 1.5),
  );
  renderer.setClearColor(0x134143, 0);
  renderer.autoClear = false;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  host.dataset.particles = String(count);
  host.dataset.buffers = "persistent";
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.z = 7.6;
  let brainDistance = 7.6,
    teamDistance = 7.6;
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [0, 0.66, 0, -0.55, -0.32, 0.04, 0.55, -0.32, -0.04],
      3,
    ),
  );
  geometry.setAttribute(
    "aBary",
    new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1], 3),
  );
  [data.targets[0], data.targets[3]].forEach((target, index) =>
    geometry.setAttribute(
      `aTarget${index}`,
      new THREE.InstancedBufferAttribute(target, 3),
    ),
  );
  [data.normals[0], data.normals[3]].forEach((normal, index) =>
    geometry.setAttribute(
      `aNormal${index}`,
      new THREE.InstancedBufferAttribute(normal, 3),
    ),
  );
  geometry.setAttribute(
    "aScatter",
    new THREE.InstancedBufferAttribute(data.scatter, 3),
  );
  geometry.setAttribute(
    "aSeed",
    new THREE.InstancedBufferAttribute(data.seeds, 4),
  );
  geometry.setAttribute(
    "aTeamStyle",
    new THREE.InstancedBufferAttribute(data.teamStyle, 3),
  );
  geometry.instanceCount = count;
  const css = getComputedStyle(host);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uMorph: { value: 0 },
      uDispersion: { value: 0 },
      uTime: { value: 0 },
      uGlyphScale: { value: 1 },
      uMint: {
        value: new THREE.Color(css.getPropertyValue("--accent").trim()),
      },
      uRaised: {
        value: new THREE.Color(css.getPropertyValue("--raised").trim()),
      },
      uFog: { value: new THREE.Color(css.getPropertyValue("--fog").trim()) },
      uBlue: { value: new THREE.Color(css.getPropertyValue("--link").trim()) },
      uGrowth: {
        value: new THREE.Color(
          css.getPropertyValue("--color-growth").trim() || "#20bfa8",
        ),
      },
      uViewport: { value: new THREE.Vector4() },
      uDpr: { value: renderer.getPixelRatio() },
    },
  });
  const sculpture = new THREE.Mesh(geometry, material);
  sculpture.frustumCulled = false;
  sculpture.renderOrder = 1;
  const group = new THREE.Group();
  group.add(sculpture);
  const depthGeometry = new THREE.BufferGeometry();
  if (brain.surface) {
    depthGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(brain.surface.positions, 3),
    );
    depthGeometry.setIndex(new THREE.BufferAttribute(brain.surface.indices, 1));
    depthGeometry.computeVertexNormals();
  }
  const depthMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 4,
  });
  const cortexMaterial = new THREE.ShaderMaterial({
    vertexShader: cortexVertexShader,
    fragmentShader: cortexFragmentShader,
    depthWrite: true,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 4,
    uniforms: {
      uDeep: { value: new THREE.Color(css.getPropertyValue("--deep").trim()) },
      uSurface: {
        value: new THREE.Color(css.getPropertyValue("--surface").trim()),
      },
      uMint: { value: material.uniforms.uMint.value },
      uPresence: { value: 1 },
    },
  });
  const cortex = new THREE.Mesh(depthGeometry, cortexMaterial);
  cortex.frustumCulled = false;
  group.add(cortex);
  const teamDepthGeometry = createTeamDepthGeometry();
  const teamOccluder = new THREE.Mesh(teamDepthGeometry, depthMaterial);
  teamOccluder.frustumCulled = false;
  group.add(teamOccluder);
  scene.add(group);
  let state: CareerFrame = {
    exchange: 0,
    chapter: 0,
    morph: 0,
    dispersion: 0,
  };
  const frameCamera = () => {
    camera.position.z = THREE.MathUtils.lerp(
      brainDistance,
      teamDistance,
      state.morph,
    );
    host.dataset.cameraDistance = camera.position.z.toFixed(3);
  };
  let disposed = false,
    active = false,
    raf = 0,
    width = 1,
    height = 1,
    frames = 0,
    last = 0,
    samples = 0,
    total = 0;
  let pointerX = 0,
    pointerY = 0,
    dampedX = 0,
    dampedY = 0;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const parent = host.parentElement!;
  const interaction = parent.parentElement!;
  const move = (event: PointerEvent) => {
    if (!fine.matches || event.pointerType === "touch") return;
    const rect = parent.getBoundingClientRect();
    const px = event.clientX - rect.left;
    if (
      px < 0 ||
      px > rect.width ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      pointerX = 0;
      pointerY = 0;
      return;
    }
    pointerX = px / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
  };
  const leave = () => {
    pointerX = 0;
    pointerY = 0;
  };
  const paint = (now: number) => {
    if (disposed || !active || document.hidden) return;
    raf = requestAnimationFrame(paint);
    dampedX += (pointerX - dampedX) * 0.06;
    dampedY += (pointerY - dampedY) * 0.06;
    material.uniforms.uTime.value = now * 0.001;
    material.uniforms.uMorph.value = state.morph;
    material.uniforms.uDispersion.value = state.dispersion;
    group.rotation.set(
      -0.06 + dampedY * 0.05 + Math.sin(now * 0.00015) * 0.025,
      -0.27 +
        state.morph * 0.54 +
        dampedX * 0.07 +
        Math.sin(now * 0.00013) * 0.035,
      Math.sin(state.morph) * 0.025,
    );
    group.scale.setScalar(0.96);
    cortex.visible = Boolean(brain.surface) && state.morph < 0.2;
    cortex.scale.setScalar(Math.max(0.001, 1 - state.dispersion * 5));
    cortexMaterial.uniforms.uPresence.value = 1 - smooth(state.morph / 0.16);
    teamOccluder.visible = state.morph > 0.8;
    teamOccluder.scale.setScalar(Math.max(0.001, 1 - state.dispersion * 5));
    renderer.setScissorTest(false);
    renderer.clear();
    // The shared visual panel moves in CSS. Its two vertical layers share the
    // same persistent scene and buffers throughout the scroll-driven morph.
    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, width, height);
    material.uniforms.uViewport.value.set(0, 0, width, height);
    const wipe = smooth((state.exchange - 0.08) / 0.34),
      split = Math.round(height * (1 - wipe));
    if (split > 0) {
      renderer.setScissor(0, 0, width, split);
      group.position.y = -wipe * 0.18;
      renderer.render(scene, camera);
    }
    if (split < height) {
      renderer.setScissor(0, split, width, height - split);
      group.position.y = (1 - wipe) * 0.18;
      renderer.render(scene, camera);
    }
    renderer.setScissorTest(false);
    host.dataset.frames = String(++frames);
    if (frames >= 3) host.dataset.ready = "true";
    if (last && samples < 60) {
      total += now - last;
      samples++;
      if (
        samples === 60 &&
        total / samples > 32 &&
        geometry.instanceCount > 6800
      ) {
        geometry.instanceCount = 6800;
        host.dataset.particles = "6800";
      }
    }
    last = now;
  };
  const start = () => {
    cancelAnimationFrame(raf);
    host.dataset.rendering = String(active && !document.hidden);
    last = 0;
    if (active && !document.hidden && !disposed)
      raf = requestAnimationFrame(paint);
  };
  const resize = () => {
    const phone = innerWidth < 1024;
    renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.25 : 1.5));
    material.uniforms.uGlyphScale.value = phone ? 1.12 : 1;
    geometry.instanceCount = Math.min(count, phone ? 4000 : count);
    host.dataset.particles = String(geometry.instanceCount);
    samples = 0;
    total = 0;
    last = 0;
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Fit each complete surface, including the depth-only cortex.
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const point = new THREE.Vector3();
    const distances = [data.targets[0], data.targets[3]].map(
      (target, index) => {
        let distance = index === 0 ? 4.3 : 3;
        const margin = index === 0 ? 0.86 : 0.92;
        const rotation = new THREE.Euler(-0.06, -0.27 + index * 0.54, 0.02);
        for (let i = 0; i < target.length; i += 3) {
          point.fromArray(target, i).multiplyScalar(0.96).applyEuler(rotation);
          distance = Math.max(
            distance,
            Math.abs(point.x) / (tangent * camera.aspect * margin) + point.z,
            Math.abs(point.y) / (tangent * margin) + point.z,
          );
        }
        return distance;
      },
    );
    // Retain the accepted brain framing. Let the smaller team network use
    // its own fit, so it does not shrink inside a short mobile visual panel.
    brainDistance = Math.max(...distances);
    teamDistance = distances[1];
    frameCamera();
    camera.updateProjectionMatrix();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    active = false;
    start();
    onFailure();
  };
  interaction.addEventListener("pointermove", move, { passive: true });
  interaction.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", start);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  return {
    update: (next) => {
      state = next;
      frameCamera();
      host.dataset.morph = next.morph.toFixed(4);
      host.dataset.dispersion = next.dispersion.toFixed(4);
    },
    setActive: (next) => {
      if (next !== active) {
        active = next;
        start();
      }
    },
    resize,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      interaction.removeEventListener("pointermove", move);
      interaction.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", start);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometry.dispose();
      material.dispose();
      cortexMaterial.dispose();
      depthGeometry.dispose();
      teamDepthGeometry.dispose();
      depthMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      host.dataset.rendering = "false";
      host.dataset.ready = "false";
    },
  };
}
