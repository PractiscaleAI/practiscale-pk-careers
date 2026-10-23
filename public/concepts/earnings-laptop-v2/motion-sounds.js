// Airy, non-tonal noise sweeps, generated once locally. No impact or beep layer.
export const motionSoundProfiles = Object.freeze({
  "lid-open": {
    duration: 0.58,
    attack: 1.6,
    release: 2.4,
    low: 700,
    high: 2900,
    peak: 0.42,
    seed: 1851,
  },
  "lid-close": {
    duration: 0.5,
    attack: 1.5,
    release: 2.8,
    low: 2500,
    high: 650,
    peak: 0.38,
    seed: 6821,
  },
  record: {
    duration: 0.23,
    attack: 1.35,
    release: 4.1,
    low: 1800,
    high: 3700,
    peak: 0.32,
    seed: 9087,
  },
  total: {
    duration: 0.3,
    attack: 1.5,
    release: 3.5,
    low: 1400,
    high: 3100,
    peak: 0.34,
    seed: 4217,
  },
});

export function createMotionSamples(sampleRate, kind = "record") {
  const profile = motionSoundProfiles[kind] || motionSoundProfiles.record;
  const samples = new Float32Array(Math.ceil(sampleRate * profile.duration));
  let seed = profile.seed,
    low = 0,
    bass = 0,
    peak = 0;
  const bassAlpha = 1 - Math.exp((-2 * Math.PI * 360) / sampleRate);
  for (let i = 0; i < samples.length; i++) {
    const u = i / (samples.length - 1);
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const white = (seed / 4294967295) * 2 - 1;
    const sweep = u * u * (3 - 2 * u);
    const cutoff = profile.low + (profile.high - profile.low) * sweep;
    const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / sampleRate);
    low += alpha * (white - low);
    bass += bassAlpha * (low - bass);
    const envelope =
      Math.pow(u, profile.attack) * Math.pow(1 - u, profile.release);
    samples[i] = (low - bass) * envelope;
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0)
    for (let i = 0; i < samples.length; i++) samples[i] *= profile.peak / peak;
  samples[0] = samples[samples.length - 1] = 0;
  return samples;
}

export const createSwitchSamples = (sampleRate) =>
  createMotionSamples(sampleRate, "record");
