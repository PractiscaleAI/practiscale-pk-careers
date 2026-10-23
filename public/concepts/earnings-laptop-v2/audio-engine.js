import {
  createMotionSamples,
  motionSoundProfiles,
} from "./motion-sounds.js?v=4";

// Audio starts in a user gesture. Number cues are emitted by rendered frames.
export function createSoundEngine(onState) {
  let audio, master, meter;
  const buffers = new Map();
  let enabled = false,
    busy = false;
  const voices = new Set(),
    history = [];
  const state = () => ({
    enabled,
    busy,
    state: audio?.state || "uninitialized",
  });
  const notify = () => onState(state());
  function initialize() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Audio is unavailable in this browser.");
    audio = new Context({ latencyHint: "interactive" });
    master = audio.createGain();
    master.gain.value = 0;
    meter = audio.createAnalyser();
    meter.fftSize = 2048;
    master.connect(meter);
    meter.connect(audio.destination);
    for (const kind of Object.keys(motionSoundProfiles)) {
      const samples = createMotionSamples(audio.sampleRate, kind);
      const buffer = audio.createBuffer(1, samples.length, audio.sampleRate);
      buffer.getChannelData(0).set(samples);
      buffers.set(kind, buffer);
    }
    audio.addEventListener("statechange", notify);
  }
  function cancel(group) {
    if (!audio) return;
    const now = audio.currentTime;
    for (const voice of voices) {
      if (group && voice.group !== group) continue;
      if (voice.envelope.gain.cancelAndHoldAtTime)
        voice.envelope.gain.cancelAndHoldAtTime(now);
      else {
        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(voice.envelope.gain.value, now);
      }
      voice.envelope.gain.linearRampToValueAtTime(0, now + 0.012);
      try {
        voice.source.stop(now + 0.014);
      } catch {}
    }
  }
  function play(kind = "record", preview = false, options = {}) {
    if (!enabled || !audio || audio.state !== "running" || document.hidden)
      return false;
    kind =
      kind === "hinge" ? "lid-open" : kind === "close" ? "lid-close" : kind;
    if (!buffers.has(kind)) return false;
    const now = audio.currentTime;
    const number = kind === "record" || kind === "total";
    const group = number ? "numbers" : "hardware";
    cancel(group);
    let start = now + 0.002;
    const visualTime = Number.isFinite(options.visualTime)
      ? options.visualTime
      : null;
    const stamp = audio.getOutputTimestamp?.();
    // Correlate output and display clocks where supported. Clamp to the next
    // render quantum rather than queue a stale cue after a rapid scroll jump.
    const paintTime = visualTime === null ? null : visualTime + 1000 / 60;
    if (paintTime !== null && stamp?.performanceTime > 0) {
      const target =
        stamp.contextTime + (paintTime - stamp.performanceTime) / 1000;
      start = Math.min(now + 0.02, Math.max(start, target));
    }
    const envelope = audio.createGain();
    envelope.connect(master);
    const source = audio.createBufferSource();
    source.buffer = buffers.get(kind);
    const length = source.buffer.duration;
    source.connect(envelope);
    envelope.gain.setValueAtTime(1, start);
    const voice = { source, envelope, group };
    voices.add(voice);
    source.addEventListener(
      "ended",
      () => {
        voices.delete(voice);
        source.disconnect();
        envelope.disconnect();
      },
      { once: true },
    );
    source.start(start);
    source.stop(start + length + 0.006);
    history.push({
      kind,
      key: options.key ?? null,
      visualTime,
      requestedAt: performance.now(),
      scheduledAudioTime: start,
      scheduleLeadMs: (start - now) * 1000,
      outputLatency: audio.outputLatency ?? null,
    });
    if (history.length > 32) history.shift();
    return true;
  }
  async function toggle() {
    if (busy) return;
    busy = true;
    notify();
    try {
      if (!audio) initialize();
      if (enabled && audio.state === "running") {
        enabled = false;
        cancel();
        master.gain.cancelScheduledValues(audio.currentTime);
        master.gain.setValueAtTime(0, audio.currentTime);
      } else {
        await audio.resume();
        if (audio.state !== "running")
          throw new Error("Sound is paused. Select sound again to resume.");
        enabled = true;
        master.gain.cancelScheduledValues(audio.currentTime);
        master.gain.setValueAtTime(0.42, audio.currentTime);
        play("record", true);
      }
    } catch (error) {
      enabled = false;
      onState({ ...state(), error: error.message });
    } finally {
      busy = false;
      notify();
    }
  }
  function sample() {
    if (!meter) return { peak: 0, rms: 0, ...state() };
    const waveform = new Float32Array(meter.fftSize);
    meter.getFloatTimeDomainData(waveform);
    let peak = 0,
      sum = 0;
    for (const value of waveform) {
      peak = Math.max(peak, Math.abs(value));
      sum += value * value;
    }
    return { peak, rms: Math.sqrt(sum / waveform.length), ...state() };
  }
  async function pause() {
    cancel();
    if (audio?.state === "running") await audio.suspend().catch(() => {});
  }
  async function resume() {
    if (enabled && audio && audio.state !== "running")
      await audio.resume().catch(() => {});
    notify();
  }
  function mute() {
    enabled = false;
    cancel();
    if (master) master.gain.setValueAtTime(0, audio.currentTime);
    notify();
  }
  return {
    toggle,
    play,
    pause,
    resume,
    mute,
    sample,
    test: () => play("record", true),
    events: () => history.map((event) => ({ ...event })),
    dispose() {
      cancel();
      for (const voice of voices) {
        try {
          voice.source.stop();
        } catch {}
      }
      voices.clear();
      audio?.close().catch(() => {});
    },
  };
}
