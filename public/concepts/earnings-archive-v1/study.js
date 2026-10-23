(() => {
  "use strict";
  const records = [
    {
      name: "Jason Brown",
      role: "Closer",
      amount: 3335320,
      period: "5 month total",
    },
    {
      name: "Hassan Ali",
      role: "Remote Closer",
      amount: 1351900,
      period: "3 month commissions",
    },
    {
      name: "Kashaf Abbasi",
      role: "Remote Closer",
      amount: 1171240,
      period: "3 month commissions",
    },
    {
      name: "Ahmed Dar",
      role: "Closer",
      amount: 1074405,
      period: "3 month commissions",
    },
    {
      name: "James Ephrim",
      role: "Closer",
      amount: 1031000,
      period: "3 month commissions",
    },
    {
      name: "Hamza Javed",
      role: "Closer",
      amount: 485000,
      period: "Last month commissions",
    },
    {
      name: "Murtaza",
      role: "Remote Closer",
      amount: 473000,
      period: "Last month paycheck",
    },
    {
      name: "Fahad",
      role: "Closer",
      amount: 342000,
      period: "Remote paycheck",
    },
    {
      name: "Kashan Malik",
      role: "Closer",
      amount: 253000,
      period: "Last month paycheck",
    },
    {
      name: "Haider Ali",
      role: "Closer",
      amount: 80000,
      period: "Two closings on day one",
    },
  ];
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  const $ = (selector) => document.querySelector(selector);
  const rail = $(".rail"),
    viewport = $(".viewport"),
    win = $(".window"),
    world = $(".world");
  const copy = $(".copy"),
    folder = $(".folder"),
    front = $(".folder-front"),
    layers = $(".paper-layers");
  const ending = $(".ending"),
    caption = $(".stage-caption"),
    index = $(".record-index");
  const soundButton = $(".sound"),
    canvas = $(".texture"),
    ctx = canvas.getContext("2d");
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const fmt = (number) => number.toLocaleString("en-US");
  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => {
    t = clamp(t);
    return t * t * (3 - 2 * t);
  };
  const range = (p, a, b) => smooth((p - a) / (b - a));
  const out = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const digits = (amount) =>
    [...fmt(amount)]
      .map((char) => `<span class="digit-mask"><span>${char}</span></span>`)
      .join("");
  const cards = records.map((record, i) => {
    const card = document.createElement("div");
    card.className = "record";
    card.dataset.record = String(i);
    card.innerHTML = `<div class="record-topline"><span>Record ${String(i + 1).padStart(2, "0")}</span><span>Sales team</span></div><h3 class="record-name">${record.name}</h3><p class="record-role">${record.role}</p><div class="record-amount"><span class="record-rs">Rs</span><span class="amount-digits">${digits(record.amount)}</span></div><p class="record-period">${record.period}</p>`;
    $(".cards").append(card);
    return { el: card, digits: [...card.querySelectorAll(".digit-mask span")] };
  });
  $(".total-number").textContent = fmt(total);
  $(".record-table tbody").innerHTML = records
    .map(
      (record) =>
        `<tr><th scope="row">${record.name}<span class="role">${record.role}</span></th><td>${fmt(record.amount)}</td><td>${record.period}</td></tr>`,
    )
    .join("");
  const strips = [...$(".collected").children];
  let folder3D = null;
  let geometry,
    raf = 0,
    previousP = 0,
    scrollDirty = true;
  let targetPointer = { x: 0.56, y: 0.42 },
    pointer = { ...targetPointer };
  let audio,
    master,
    noise,
    enabled = false,
    soundBusy = false,
    lastCueAt = -10000;
  let visible = true,
    alive = true;
  const cleanup = [];
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    cleanup.push(() => target.removeEventListener(event, handler, options));
  };

  // The scene is a deterministic function of scroll progress. It can be sampled
  // at an exact frame time for a later film or frame-sequence render.
  function drawScene(p) {
    const { width: W, height: H, portrait, slot, staticMode } = geometry;
    const expand = staticMode ? 0 : range(p, 0, 0.155);
    const x = slot.x * (1 - expand),
      y = slot.y * (1 - expand);
    const w = mix(slot.w, W, expand),
      h = mix(slot.h, H, expand);
    const sx = w / W,
      sy = h / H;
    const scale = Math.min(
      w / (portrait ? 620 : 1200),
      h / (portrait ? 900 : 800),
    );
    win.style.transform = `translate3d(${x}px,${y}px,0) scale(${sx},${sy})`;
    const radius = mix(22, 0, expand);
    win.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
    world.style.transform = `scale(${scale / sx},${scale / sy})`;
    win.style.setProperty("--light-x", `${pointer.x * 100}%`);
    win.style.setProperty("--light-y", `${pointer.y * 100}%`);
    copy.style.opacity = String(1 - range(p, 0.012, 0.13));
    copy.style.pointerEvents = p > 0.12 ? "none" : "";
    caption.style.opacity = String(range(p, 0.14, 0.18));
    const opening = range(p, 0.165, 0.242),
      finale = range(p, 0.855, 0.955);
    const parallaxX =
      finePointer.matches && !staticMode ? (pointer.x - 0.5) * 2 : 0;
    const parallaxY =
      finePointer.matches && !staticMode ? (pointer.y - 0.5) * 1.5 : 0;
    folder.style.transform = `perspective(1400px) translate3d(0,${mix(0, 120, finale)}px,0) rotateX(${mix(10, 4, opening) + parallaxY}deg) rotateY(${mix(-15, -6, opening) + parallaxX}deg) rotateZ(${mix(-7, -3, opening)}deg) scale(${(portrait ? 0.88 : 1) * mix(1, 0.76, finale)})`;
    folder.style.opacity = String(1 - finale);
    front.style.transform = `translateZ(12px) rotateX(${-opening * 66}deg)`;
    layers.style.transform = `translate3d(0,${-opening * 26}px,4px)`;
    folder3D?.render({ opening, finale, portrait, pointer, staticMode });
    const start = 0.24,
      span = 0.061;
    let active = -1;
    cards.forEach((card, i) => {
      const t = (p - start - i * span) / span;
      const enter = out(t / 0.27),
        leave = range(t, 0.79, 1);
      const appearing = t >= 0 && t < 1.12;
      const fade = range(t, -0.015, 0.08) * (1 - range(t, 0.9, 1.07));
      card.el.style.opacity = appearing
        ? String(fade * (1 - range(p, 0.859, 0.885)))
        : "0";
      card.el.style.visibility = appearing ? "visible" : "hidden";
      if (appearing) {
        const sideways = (portrait ? -105 : -340) * leave;
        const yy =
          mix(portrait ? 85 : 30, portrait ? -115 : -88, enter) +
          (portrait ? 175 : 135) * leave;
        const ss = mix(0.78, 1, enter) - leave * 0.35;
        card.el.style.transform = `perspective(1800px) translate3d(${sideways}px,${yy}px,${mix(20, 100, enter)}px) rotateX(${mix(-27, 0, enter)}deg) rotateY(${mix(8, 0, enter) - leave * 16}deg) rotateZ(${mix(4, 0, enter) - leave * 10}deg) scale(${ss})`;
        card.el.style.clipPath = `inset(0 0 ${(1 - enter) * 55}% 0 round 12px)`;
        card.digits.forEach((digit, j) => {
          const reveal = out((t - 0.16 - j * 0.009) / 0.17);
          digit.style.transform = `translate3d(0,${(1 - reveal) * 110}%,0)`;
          digit.style.opacity = String(
            range(t, 0.15 + j * 0.009, 0.25 + j * 0.009),
          );
        });
        if (t >= 0.27 && t <= 0.9) active = i;
      }
    });
    ending.style.opacity = String(finale);
    ending.style.transform = `translate3d(0,${(1 - finale) * 36}px,120px) scale(${mix(0.95, 1, finale)})`;
    strips.forEach((strip, i) => {
      const q = range(p, 0.875 + i * 0.003, 0.94 + i * 0.003);
      strip.style.transform = `translate3d(${mix((i - 4.5) * 45, (i - 4.5) * 4, q)}px,${i * 3.6}px,0) rotate(${mix((i - 4.5) * 8, (i - 4.5) * 0.7, q)}deg)`;
      strip.style.opacity = String(q * 0.84);
    });
    index.textContent =
      p > 0.85
        ? "10 / 10 COLLECTED"
        : active >= 0
          ? `${String(active + 1).padStart(2, "0")} / 10`
          : "10 RECORDS";
    rail.dataset.progress = p.toFixed(5);
    rail.dataset.activeRecord = String(active);
    rail.dataset.expanded = String(expand === 1);
    canvas.dataset.pointerX = pointer.x.toFixed(3);
    canvas.dataset.pointerY = pointer.y.toFixed(3);
    if (enabled && p > previousP && p - previousP < 0.035) {
      const cue = (a, kind) => {
        if (previousP < a && p >= a) playCue(kind);
      };
      cue(0.195, "paper");
      records.forEach((_, i) => cue(start + i * span + span * 0.32, "settle"));
      cue(0.948, "resolve");
    }
    previousP = p;
    return { expand, scale, x, y, w, h };
  }

  function drawTexture(p) {
    if (!ctx) return;
    const { width: W, height: H, dpr } = geometry;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const mx = pointer.x * W,
      my = pointer.y * H;
    const radius = Math.min(W, H) * 0.55;
    // A low-contrast contoured field deforms locally around the pointer.
    // Scroll supplies the same slow field movement on touch devices.
    ctx.lineWidth = 0.7;
    for (let row = -3; row < Math.ceil(H / 24) + 5; row++) {
      const by = row * 24;
      ctx.strokeStyle =
        row % 4 === 0 ? "rgba(155,227,214,.07)" : "rgba(155,227,214,.032)";
      ctx.beginPath();
      for (let xx = -30; xx <= W + 40; xx += 24) {
        const dx = xx - mx,
          dy = by - my;
        const force = Math.exp(-(dx * dx + dy * dy) / (radius * radius));
        const wave = Math.sin(xx * 0.006 + by * 0.009 + p * 5) * 8;
        const bend = force * (my - by) * 0.12;
        const yy = by + wave + bend + Math.sin(xx * 0.002 - p * 3) * 10;
        if (xx === -30) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(189,211,211,.085)";
    for (let xx = 13; xx < W; xx += 42)
      for (let yy = 19; yy < H; yy += 42) {
        const force = Math.exp(
          -((xx - mx) ** 2 + (yy - my) ** 2) / (radius * radius),
        );
        ctx.fillRect(
          xx + force * (mx - xx) * 0.025,
          yy + force * (my - yy) * 0.025,
          0.7,
          0.7,
        );
      }
  }

  function measure() {
    const width = document.documentElement.clientWidth;
    const height = viewport.clientHeight;
    const portrait = width < height;
    document.body.classList.toggle("portrait", portrait);
    const staticMode =
      motionQuery.matches || navigator.connection?.saveData === true;
    rail.dataset.mode = staticMode ? "static" : "motion";
    const gutter = Math.min(64, Math.max(24, width * 0.04));
    const copyRect = copy.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();
    const narrow = portrait;
    const top = narrow
      ? copyRect.bottom - viewRect.top + 24
      : Math.max(100, height * 0.23);
    const slot = narrow
      ? {
          x: gutter,
          y: top,
          w: width - gutter * 2,
          h: Math.max(120, height - top - 34),
        }
      : {
          x: width * 0.465,
          y: top,
          w: width * 0.535 - gutter,
          h: Math.min(height - top - 64, height * 0.58),
        };
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    geometry = {
      width,
      height,
      portrait,
      slot,
      staticMode,
      dpr,
      top: rail.getBoundingClientRect().top + scrollY,
      travel: Math.max(1, rail.offsetHeight - height),
    };
    soundButton.hidden =
      staticMode ||
      !("AudioContext" in window || "webkitAudioContext" in window);
    requestDraw();
  }

  function tick() {
    raf = 0;
    if (!visible || !alive || !geometry) return;
    const started = performance.now();
    pointer.x = mix(pointer.x, targetPointer.x, 0.17);
    pointer.y = mix(pointer.y, targetPointer.y, 0.17);
    const p = geometry.staticMode
      ? 0
      : clamp((scrollY - geometry.top) / geometry.travel);
    drawScene(p);
    drawTexture(p);
    const cost = performance.now() - started;
    rail.dataset.lastDrawMs = cost.toFixed(2);
    scrollDirty = false;
    if (
      Math.abs(pointer.x - targetPointer.x) +
        Math.abs(pointer.y - targetPointer.y) >
      0.001
    )
      requestDraw();
  }
  function requestDraw() {
    if (!raf && visible && alive) raf = requestAnimationFrame(tick);
  }
  const onScroll = () => {
    scrollDirty = true;
    requestDraw();
  };
  const onPointer = (event) => {
    if (!finePointer.matches || geometry.staticMode) return;
    targetPointer = {
      x: clamp(event.clientX / geometry.width),
      y: clamp(event.clientY / geometry.height),
    };
    requestDraw();
  };
  listen(window, "scroll", onScroll, { passive: true });
  listen(viewport, "pointermove", onPointer, { passive: true });
  listen(viewport, "pointerleave", () => {
    targetPointer = { x: 0.56, y: 0.42 };
    requestDraw();
  });
  listen(window, "resize", measure, { passive: true });
  listen(motionQuery, "change", () => {
    if (motionQuery.matches) setSound(false);
    measure();
  });
  listen(document, "visibilitychange", () => {
    visible = !document.hidden;
    if (!visible) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      audio?.suspend().catch(() => {});
    } else {
      if (enabled) audio?.resume().catch(() => {});
      requestDraw();
    }
  });
  const observer = new ResizeObserver(measure);
  observer.observe(copy);
  cleanup.push(() => observer.disconnect());
  const visibility = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      if (visible) {
        if (enabled) audio?.resume().catch(() => {});
        requestDraw();
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        audio?.suspend().catch(() => {});
      }
    },
    { rootMargin: "100px" },
  );
  visibility.observe(rail);
  cleanup.push(() => visibility.disconnect());

  function setSound(value) {
    enabled = value;
    soundButton.setAttribute("aria-pressed", String(value));
    soundButton.setAttribute(
      "aria-label",
      value
        ? "Sound on, mute sound effects"
        : "Sound off, enable sound effects",
    );
    soundButton.querySelector("span").textContent = value
      ? "Sound on"
      : "Sound off";
    if (master && audio)
      master.gain.setTargetAtTime(value ? 0.22 : 0, audio.currentTime, 0.035);
  }
  async function toggleSound() {
    if (soundBusy) return;
    soundBusy = true;
    try {
      if (!audio) {
        const Constructor = window.AudioContext || window.webkitAudioContext;
        audio = new Constructor();
        master = audio.createGain();
        master.gain.value = 0;
        master.connect(audio.destination);
        noise = audio.createBuffer(
          1,
          Math.floor(audio.sampleRate * 0.25),
          audio.sampleRate,
        );
        const channel = noise.getChannelData(0);
        let seed = 107;
        for (let i = 0; i < channel.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          channel[i] = (seed / 4294967296) * 2 - 1;
        }
      }
      if (audio.state === "suspended") await audio.resume();
      setSound(!enabled);
      if (enabled) playCue("settle");
    } catch {
      setSound(false);
      soundButton.querySelector("span").textContent = "Sound unavailable";
    } finally {
      soundBusy = false;
    }
  }
  listen(soundButton, "click", toggleSound);

  function playCue(kind) {
    if (!audio || !master || !enabled || !visible || audio.state !== "running")
      return;
    const now = audio.currentTime;
    if (now - lastCueAt < 0.55) return;
    lastCueAt = now;
    if (kind === "paper") {
      const source = audio.createBufferSource(),
        filter = audio.createBiquadFilter(),
        gain = audio.createGain();
      source.buffer = noise;
      filter.type = "bandpass";
      filter.frequency.value = 1600;
      filter.Q.value = 0.7;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      source.start(now);
      source.stop(now + 0.24);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    } else {
      const oscillator = audio.createOscillator(),
        gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(kind === "resolve" ? 220 : 570, now);
      oscillator.frequency.exponentialRampToValueAtTime(
        kind === "resolve" ? 330 : 270,
        now + 0.1,
      );
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(
        kind === "resolve" ? 0.085 : 0.055,
        now + 0.008,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + (kind === "resolve" ? 0.62 : 0.12),
      );
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + (kind === "resolve" ? 0.66 : 0.14));
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    }
  }
  listen(
    window,
    "pagehide",
    () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      cleanup.forEach((fn) => fn());
      audio?.close().catch(() => {});
      folder3D?.dispose();
    },
    { once: true },
  );
  document.fonts.ready.then(async () => {
    if (!alive) return;
    measure();
    try {
      const { createArchiveFolder } = await import("./folder-3d.js");
      const model = await createArchiveFolder(world);
      if (!alive) {
        model?.dispose();
        return;
      }
      folder3D = model;
      document.body.dataset.folderRenderer = model ? "webgl" : "fallback";
      requestDraw();
    } catch {
      document.body.dataset.folderRenderer = "fallback";
    }
  });
  measure();
})();
