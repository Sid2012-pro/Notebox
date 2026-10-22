'use strict';

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const MAX_STEPS = 64;
const MIN_P = 24;
const MAX_P = 96;
const LABEL_W = 56;
const RULER = 16;
const ROW_H = 14;
const NAMES = {
    sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};
const BLACK = [1, 3, 6, 8, 10];
const SCALES = {
    'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    'Major': [0, 2, 4, 5, 7, 9, 11],
    'Minor': [0, 2, 3, 5, 7, 8, 10],
    'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
    'Dorian': [0, 2, 3, 5, 7, 9, 10],
    'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'Pentatonic Major': [0, 2, 4, 7, 9],
    'Pentatonic Minor': [0, 3, 5, 7, 10],
    'Blues': [0, 3, 5, 6, 7, 10]
};

const DRUMS = [
    { id: 'kick', label: 'KICK', gm: 36 },
    { id: 'snare', label: 'SNARE', gm: 38 },
    { id: 'clap', label: 'CLAP', gm: 39 },
    { id: 'chat', label: 'HAT C', gm: 42 },
    { id: 'ohat', label: 'HAT O', gm: 46 },
    { id: 'tomh', label: 'TOM H', gm: 50 },
    { id: 'toml', label: 'TOM L', gm: 45 },
    { id: 'crash', label: 'CRASH', gm: 49 }
];

const PRESETS = {
    'Chip Lead': { wave: 'square', a: 0.005, d: 0.08, s: 0.6, r: 0.1, cutoff: 9000, detune: 0 },
    'Saw Lead': { wave: 'sawtooth', a: 0.01, d: 0.1, s: 0.7, r: 0.2, cutoff: 5000, detune: 8 },
    'Pluck': { wave: 'triangle', a: 0.002, d: 0.2, s: 0.05, r: 0.12, cutoff: 7000, detune: 0 },
    'Warm Pad': { wave: 'sawtooth', a: 0.4, d: 0.3, s: 0.8, r: 0.9, cutoff: 1800, detune: 14 },
    'Sub Bass': { wave: 'triangle', a: 0.005, d: 0.1, s: 0.85, r: 0.1, cutoff: 1200, detune: 0 },
    'Reese Bass': { wave: 'sawtooth', a: 0.01, d: 0.2, s: 0.8, r: 0.15, cutoff: 700, detune: 18 }
};

const SLIDERS = [
    ['a', 'ATK', 0.001, 1.5, 0.001, v => v.toFixed(2)],
    ['d', 'DEC', 0.01, 1.5, 0.01, v => v.toFixed(2)],
    ['s', 'SUS', 0, 1, 0.01, v => v.toFixed(2)],
    ['r', 'REL', 0.01, 2.5, 0.01, v => v.toFixed(2)],
    ['cutoff', 'CUT', 200, 12000, 10, v => Math.round(v)],
    ['detune', 'DET', 0, 40, 1, v => Math.round(v)]
];

const PANELS = [
    ['panelInstruments', 'Instruments'],
    ['panelMixer', 'Track Mixer'],
    ['panelBeat', 'Beat Sequencer'],
    ['panelRoll', 'Piano Roll']
];

const KEYMAP = {
    'a': 0,
    'w': 1,
    's': 2,
    'e': 3,
    'd': 4,
    'f': 5,
    't': 6,
    'g': 7,
    'y': 8,
    'h': 9,
    'u': 10,
    'j': 11,
    'k': 12,
    'o': 13,
    'l': 14,
    'p': 15,
    ';': 16
};

const isKey = k => Object.prototype.hasOwnProperty.call(KEYMAP, k);

const THEMES = {
    Neon: {
        '--bg-dark': '#141620',
        '--panel-bg': '#121318',
        '--panel-border': '#1f2340',
        '--neon-cyan': '#63f6d8',
        '--neon-pink': '#ee5588',
        '--neon-yellow': '#eed261',
        '--neon-purple': '#9d7bff',
        '--text-dim': '#7987bc',
        '--row-a': '#151826',
        '--row-b': '#0e1019',
        '--line-1': '#1c2033',
        '--line-2': '#2a2f4c',
        '--line-3': '#4a5185',
        '--key-w': '#d8dcf0',
        '--key-b': '#1e2236'
    },
    Amber: {
        '--bg-dark': '#1a1200',
        '--panel-bg': '#140e00',
        '--panel-border': '#3a2a00',
        '--neon-cyan': '#ffbb00',
        '--neon-pink': '#ff6a00',
        '--neon-yellow': '#ffd966',
        '--neon-purple': '#d9944a',
        '--text-dim': '#a67c00',
        '--row-a': '#1d1500',
        '--row-b': '#120c00',
        '--line-1': '#2a1e00',
        '--line-2': '#443100',
        '--line-3': '#7a5a00',
        '--key-w': '#f3deb0',
        '--key-b': '#2a1c00'
    },
    Gameboy: {
        '--bg-dark': '#0f380f',
        '--panel-bg': '#0b2d0b',
        '--panel-border': '#306230',
        '--neon-cyan': '#9bbc0f',
        '--neon-pink': '#8bac0f',
        '--neon-yellow': '#cadc9f',
        '--neon-purple': '#6f9a1f',
        '--text-dim': '#5f8d2e',
        '--row-a': '#0f380f',
        '--row-b': '#0a2a0a',
        '--line-1': '#164a16',
        '--line-2': '#206020',
        '--line-3': '#3c8a3c',
        '--key-w': '#cadc9f',
        '--key-b': '#0f380f'
    }
};

const DEFAULT_SETTINGS = {
    acc: 'sharp',
    root: 0,
    scale: 'Chromatic',
    highlight: true,
    snapScale: false,
    follow: true,
    loop: true,
    metro: false,
    theme: 'Neon',
    crt: true,
    noteLen: 1,
    hidden: {},
    kbOct: 4
};

let S = loadSettings();
let P = null;
let curTrack = 0;
let selection = new Set();
let clipboard = [];
const undoStack = [];
const redoStack = [];
let dirty = false;
let needsDraw = true;
const view = {
    cellW: 28,
    scrollX: 0,
    topPitch: 79
};
const C = {};
const trackColor = i => [C.cyan, C.pink, C.yellow, C.purple][i];

let audioCtx = null;
let live = null;
let playing = false;
let recording = false;
let cursor = 0;
let timer = null;
let nextStep = 0;
let nextTime = 0;
let ending = null;
const queue = [];
let dispStep = 0;
let dispTime = 0;
const voices = new Set();
const held = new Map();

const steps = () => P.bars * 16;
const stepDur = () => 60 / P.bpm / 4;
const swingOffset = (s, st) => (s % 2 === 1 ? P.swing * st * 0.4 : 0);
const drumTrack = () => P.tracks.find(t => t.kind === 'drums');

function loadSettings() {
    try {
        const stored = JSON.parse(localStorage.getItem('notebox-settings')) || {};
        const s = { ...DEFAULT_SETTINGS, hidden: {}, ...stored };
        if (!THEMES[s.theme]) {
            s.theme = DEFAULT_SETTINGS.theme;
        }
        if (!SCALES[s.scale]) {
            s.scale = DEFAULT_SETTINGS.scale;
        }
        if (!NAMES[s.acc]) {
            s.acc = DEFAULT_SETTINGS.acc;
        }
        return s;
    } catch {
        return { ...DEFAULT_SETTINGS, hidden: {} };
    }
}

function saveSettings() {
    try {
        localStorage.setItem('notebox-settings', JSON.stringify(S));
    } catch {
        return;
    }
}

const noteName = p => NAMES[S.acc][p % 12] + (Math.floor(p / 12) - 1);
const relPc = p => (((p - S.root) % 12) + 12) % 12;
const inScale = p => SCALES[S.scale].includes(relPc(p));
const isRoot = p => relPc(p) === 0;

function snapPitch(p) {
    if (!S.snapScale || S.scale === 'Chromatic') {
        return p;
    }
    for (const d of [0, 1, -1, 2, -2]) {
        if (inScale(p + d) && p + d >= MIN_P && p + d <= MAX_P) {
            return p + d;
        }
    }
    return p;
}

function emptyProject() {
    const grid = () => Array.from({ length: 8 }, () => Array(MAX_STEPS).fill(0));
    const syn = (name, preset, vol) => ({
        name,
        kind: 'synth',
        preset,
        ...PRESETS[preset],
        vol,
        pan: 0,
        mute: false,
        solo: false,
        notes: []
    });
    return {
        v: 1,
        bpm: 110,
        bars: 2,
        swing: 0,
        master: 0.8,
        tracks: [
            syn('LEAD', 'Chip Lead', 0.75),
            syn('BASS', 'Sub Bass', 0.85),
            syn('PAD', 'Warm Pad', 0.5),
            { name: 'DRUMS', kind: 'drums', vol: 0.9, pan: 0, mute: false, solo: false, grid: grid() }
        ]
    };
}

function demoProject() {
    const p = emptyProject();
    const add = (ti, list) => list.forEach(([pp, s, l]) => p.tracks[ti].notes.push({ p: pp, s, l }));
    add(0, [
        [69, 0, 2],
        [72, 2, 2],
        [76, 4, 4],
        [74, 8, 2],
        [72, 10, 2],
        [71, 12, 4],
        [69, 16, 2],
        [72, 18, 2],
        [76, 20, 2],
        [79, 22, 2],
        [77, 24, 4],
        [76, 28, 4]
    ]);
    add(1, [
        [45, 0, 3],
        [45, 4, 2],
        [48, 8, 2],
        [43, 12, 3],
        [41, 16, 3],
        [41, 20, 2],
        [45, 24, 2],
        [48, 28, 3]
    ]);
    add(2, [
        [57, 0, 16],
        [60, 0, 16],
        [64, 0, 16],
        [53, 16, 16],
        [57, 16, 16],
        [60, 16, 16]
    ]);
    const g = p.tracks[3].grid;
    for (const o of [0, 16]) {
        [0, 6, 10].forEach(s => (g[0][o + s] = 1));
        [4, 12].forEach(s => (g[1][o + s] = 1));
        for (let s = 0; s < 16; s += 2) {
            g[3][o + s] = 1;
        }
        g[4][o + 14] = 1;
    }
    g[2][12] = 1;
    g[7][0] = 1;
    p.bpm = 110;
    return p;
}

function normalize(o) {
    if (!o || !Array.isArray(o.tracks)) {
        throw new Error('bad project');
    }
    const b = emptyProject();
    b.bpm = clamp(+o.bpm || 110, 40, 240);
    b.bars = clamp(Math.round(+o.bars || 2), 1, 4);
    b.swing = clamp(+o.swing || 0, 0, 1);
    b.master = clamp(+(o.master ?? 0.8) || 0, 0, 1);
    b.tracks.forEach((t, i) => {
        const s = o.tracks[i];
        if (!s) {
            return;
        }
        for (const k of ['preset', 'wave', 'a', 'd', 's', 'r', 'cutoff', 'detune', 'vol', 'pan', 'mute', 'solo']) {
            if (k in s && k in t) {
                t[k] = s[k];
            }
        }
        if (t.kind === 'synth' && Array.isArray(s.notes)) {
            t.notes = s.notes
                .filter(n => n && Number.isFinite(n.p) && Number.isFinite(n.s) && Number.isFinite(n.l))
                .map(n => ({
                    p: clamp(n.p | 0, MIN_P, MAX_P),
                    s: clamp(n.s | 0, 0, MAX_STEPS - 1),
                    l: clamp(n.l | 0, 1, MAX_STEPS)
                }));
        }
        if (t.kind === 'drums' && Array.isArray(s.grid)) {
            t.grid.forEach((row, r) => {
                if (Array.isArray(s.grid[r])) {
                    for (let c = 0; c < MAX_STEPS; c++) {
                        row[c] = s.grid[r][c] ? 1 : 0;
                    }
                }
            });
        }
    });
    return b;
}

const snapshot = () => JSON.stringify(P);

function checkpoint() {
    undoStack.push(snapshot());
    if (undoStack.length > 100) {
        undoStack.shift();
    }
    redoStack.length = 0;
    dirty = true;
}

function undo() {
    if (!undoStack.length) {
        return toast('Nothing to undo');
    }
    redoStack.push(snapshot());
    P = JSON.parse(undoStack.pop());
    afterLoad();
    toast('Undo');
}

function redo() {
    if (!redoStack.length) {
        return toast('Nothing to redo');
    }
    undoStack.push(snapshot());
    P = JSON.parse(redoStack.pop());
    afterLoad();
    toast('Redo');
}

function afterLoad() {
    selection.clear();
    held.forEach(h => (h.note = null));
    dirty = true;
    if (cursor >= steps()) {
        cursor = 0;
    }
    applyMix();
    selectTrack(curTrack);
    syncTransport();
    needsDraw = true;
}

setInterval(() => {
    if (dirty && P) {
        try {
            localStorage.setItem('notebox-project', snapshot());
        } catch {
            return;
        }
        dirty = false;
    }
}, 2000);

function ensureAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        live = buildGraph(audioCtx);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function setP(ctx, param, v) {
    if (ctx.currentTime === 0) {
        param.value = v;
    } else {
        param.setTargetAtTime(v, ctx.currentTime, 0.01);
    }
}

const audible = t => !t.mute && (!P.tracks.some(x => x.solo) || t.solo);

function buildGraph(ctx) {
    const master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
    const buses = P.tracks.map(() => {
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner();
        gain.connect(pan);
        pan.connect(master);
        return { gain, pan };
    });
    const g = { ctx, master, buses };
    applyMix(g);
    return g;
}

function applyMix(g = live) {
    if (!g) {
        return;
    }
    setP(g.ctx, g.master.gain, P.master);
    P.tracks.forEach((t, i) => {
        setP(g.ctx, g.buses[i].gain.gain, audible(t) ? t.vol : 0);
        setP(g.ctx, g.buses[i].pan.pan, t.pan);
    });
}

function voice(ctx, dest, inst, midi, t, dur, vel = 0.8) {
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = inst.cutoff;
    const detunes = inst.detune > 0 ? [-inst.detune, inst.detune] : [0];
    const oscs = detunes.map(dc => {
        const o = ctx.createOscillator();
        o.type = inst.wave;
        o.frequency.value = f;
        o.detune.value = dc;
        o.connect(lp);
        o.start(t);
        return o;
    });
    lp.connect(g);
    g.connect(dest);
    const peak = (0.2 * vel) / (detunes.length > 1 ? 1.4 : 1);
    const a = Math.max(0.001, inst.a);
    const d = Math.max(0.001, inst.d);
    const s = inst.s;
    const r = Math.max(0.01, inst.r);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.linearRampToValueAtTime(peak * s, t + a + d);
    let done = false;
    const v = {
        release(at) {
            if (done) {
                return;
            }
            done = true;
            const tr = Math.max(at, t + a + d);
            g.gain.setValueAtTime(peak * s, tr);
            g.gain.linearRampToValueAtTime(0, tr + r);
            oscs.forEach(o => o.stop(tr + r + 0.05));
        },
        kill() {
            const n = ctx.currentTime;
            done = true;
            g.gain.cancelScheduledValues(n);
            g.gain.setValueAtTime(g.gain.value, n);
            g.gain.linearRampToValueAtTime(0, n + 0.03);
            oscs.forEach(o => {
                try {
                    o.stop(n + 0.05);
                } catch {
                    return;
                }
            });
        }
    };
    if (ctx === audioCtx) {
        voices.add(v);
        oscs[0].onended = () => {
            voices.delete(v);
            try {
                g.disconnect();
            } catch {
                return;
            }
        };
    }
    if (dur != null) {
        v.release(t + dur);
    }
    return v;
}

const killVoices = () => {
    voices.forEach(v => v.kill());
    voices.clear();
};

const noiseCache = new WeakMap();

function noiseSrc(ctx, t, dur) {
    let b = noiseCache.get(ctx);
    if (!b) {
        b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = Math.random() * 2 - 1;
        }
        noiseCache.set(ctx, b);
    }
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.loop = true;
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur);
    return s;
}

function envGain(ctx, peak, t, dur) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    return g;
}

function noiseHit(ctx, dest, t, type, freq, q, dur, peak) {
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    noiseSrc(ctx, t, dur).connect(f);
    f.connect(envGain(ctx, peak, t, dur)).connect(dest);
}

function toneHit(ctx, dest, t, type, f0, f1, dur, peak) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.5);
    o.connect(envGain(ctx, peak, t, dur)).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.02);
}

function clapHit(ctx, dest, t) {
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1400;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    [0, 0.012, 0.024].forEach(o => {
        g.gain.setValueAtTime(0.7, t + o);
        g.gain.exponentialRampToValueAtTime(0.1, t + o + 0.01);
    });
    g.gain.setValueAtTime(0.7, t + 0.036);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    noiseSrc(ctx, t, 0.25).connect(f);
    f.connect(g).connect(dest);
}

function drumHit(ctx, dest, id, t) {
    switch (id) {
        case 'kick':
            toneHit(ctx, dest, t, 'sine', 150, 42, 0.38, 1);
            break;
        case 'snare':
            noiseHit(ctx, dest, t, 'highpass', 1500, 0.7, 0.18, 0.6);
            toneHit(ctx, dest, t, 'triangle', 200, 120, 0.1, 0.5);
            break;
        case 'clap':
            clapHit(ctx, dest, t);
            break;
        case 'chat':
            noiseHit(ctx, dest, t, 'highpass', 7500, 0.7, 0.05, 0.35);
            break;
        case 'ohat':
            noiseHit(ctx, dest, t, 'highpass', 7500, 0.7, 0.28, 0.35);
            break;
        case 'tomh':
            toneHit(ctx, dest, t, 'sine', 230, 120, 0.3, 0.8);
            break;
        case 'toml':
            toneHit(ctx, dest, t, 'sine', 150, 80, 0.35, 0.8);
            break;
        case 'crash':
            noiseHit(ctx, dest, t, 'highpass', 5000, 0.5, 1.0, 0.4);
            break;
    }
}

function click(g, accent, t) {
    const o = g.ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = accent ? 2000 : 1400;
    o.connect(envGain(g.ctx, 0.12, t, 0.03)).connect(g.master);
    o.start(t);
    o.stop(t + 0.04);
}

function scheduleStep(g, step, t, isLive) {
    const st = stepDur();
    P.tracks.forEach((tr, i) => {
        if (!audible(tr)) {
            return;
        }
        const dest = g.buses[i].gain;
        if (tr.kind === 'synth') {
            for (const n of tr.notes) {
                if (n.s === step) {
                    voice(g.ctx, dest, tr, n.p, t, Math.min(n.l, steps() - n.s) * st, 0.8);
                }
            }
        } else {
            DRUMS.forEach((d, r) => {
                if (tr.grid[r][step]) {
                    drumHit(g.ctx, dest, d.id, t);
                }
            });
        }
    });
    if (isLive && S.metro && step % 4 === 0) {
        click(g, step % 16 === 0, t);
    }
}

function scheduler() {
    if (ending !== null) {
        if (audioCtx.currentTime >= ending) {
            stop();
        }
        return;
    }
    const st = stepDur();
    if (nextTime < audioCtx.currentTime - 0.25) {
        nextTime = audioCtx.currentTime + 0.05;
    }
    while (nextTime < audioCtx.currentTime + 0.12) {
        if (nextStep >= steps()) {
            if (S.loop) {
                nextStep = 0;
            } else {
                ending = nextTime + 0.5;
                return;
            }
        }
        const t = nextTime + swingOffset(nextStep, st);
        scheduleStep(live, nextStep, t, true);
        queue.push({ step: nextStep, time: t });
        nextTime += st;
        nextStep++;
    }
}

function play() {
    ensureAudio();
    if (playing) {
        return;
    }
    playing = true;
    ending = null;
    nextStep = cursor % steps();
    nextTime = audioCtx.currentTime + 0.06;
    queue.length = 0;
    dispStep = nextStep;
    dispTime = nextTime;
    timer = setInterval(scheduler, 25);
    syncTransport();
}

function pause() {
    if (!playing) {
        return;
    }
    playing = false;
    ending = null;
    clearInterval(timer);
    cursor = dispStep % steps();
    killVoices();
    syncTransport();
    needsDraw = true;
}

function stop() {
    pause();
    cursor = 0;
    dispStep = 0;
    syncTransport();
    needsDraw = true;
}

const togglePlay = () => (playing ? pause() : play());

function seek(step) {
    step = clamp(step, 0, steps() - 1);
    cursor = step;
    dispStep = step;
    if (playing) {
        nextStep = step;
        nextTime = audioCtx.currentTime + 0.05;
        ending = null;
        queue.length = 0;
        killVoices();
        dispTime = nextTime;
    }
    needsDraw = true;
}

function previewPitch(p) {
    ensureAudio();
    const tr = P.tracks[curTrack];
    voice(audioCtx, live.buses[curTrack].gain, tr, p, audioCtx.currentTime, 0.22, 0.8);
}

function previewDrum(r) {
    ensureAudio();
    drumHit(audioCtx, live.buses[P.tracks.indexOf(drumTrack())].gain, DRUMS[r].id, audioCtx.currentTime);
}

function recStep() {
    const frac = (audioCtx.currentTime - dispTime) / stepDur();
    return (dispStep + (frac > 0.5 ? 1 : 0)) % steps();
}

function startLive(k) {
    ensureAudio();
    const midi = clamp((S.kbOct + 1) * 12 + KEYMAP[k], 12, 120);
    const tr = P.tracks[curTrack];
    const v = voice(audioCtx, live.buses[curTrack].gain, tr, midi, audioCtx.currentTime, null, 0.9);
    const h = { v, note: null };
    if (recording && playing) {
        checkpoint();
        h.note = {
            p: clamp(midi, MIN_P, MAX_P),
            s: recStep(),
            l: 1
        };
        tr.notes.push(h.note);
    }
    held.set(k, h);
    needsDraw = true;
}

function releaseLive(k) {
    const h = held.get(k);
    if (!h) {
        return;
    }
    h.v.release(audioCtx.currentTime);
    if (h.note) {
        const l = (playing ? dispStep : h.note.s) - h.note.s + 1;
        h.note.l = clamp(l < 1 ? 1 : l, 1, steps() - h.note.s);
        dirty = true;
    }
    held.delete(k);
    needsDraw = true;
}

function releaseAllLive() {
    [...held.keys()].forEach(releaseLive);
}

const curNotes = () => P.tracks[curTrack].notes;

function selectAll() {
    selection = new Set(curNotes());
    needsDraw = true;
}

function deleteSel() {
    if (!selection.size) {
        return;
    }
    checkpoint();
    const tr = P.tracks[curTrack];
    tr.notes = tr.notes.filter(n => !selection.has(n));
    selection.clear();
    needsDraw = true;
}

function copySel() {
    if (!selection.size) {
        return toast('Select notes first');
    }
    clipboard = [...selection].map(n => ({ p: n.p, s: n.s, l: n.l }));
    toast(`Copied ${clipboard.length} note(s)`);
}

function cutSel() {
    copySel();
    if (selection.size) {
        deleteSel();
    }
}

function pasteSel() {
    if (!clipboard.length) {
        return toast('Clipboard is empty');
    }
    checkpoint();
    const at = playing ? dispStep : cursor;
    const min = Math.min(...clipboard.map(n => n.s));
    selection.clear();
    clipboard.forEach(n => {
        const s = n.s - min + at;
        if (s >= steps()) {
            return;
        }
        const nn = { p: n.p, s, l: Math.min(n.l, steps() - s) };
        curNotes().push(nn);
        selection.add(nn);
    });
    needsDraw = true;
    toast(`Pasted at step ${at + 1} (click ruler to move)`);
}

function duplicateSel() {
    if (!selection.size) {
        return toast('Select notes first');
    }
    checkpoint();
    const arr = [...selection];
    const min = Math.min(...arr.map(n => n.s));
    const max = Math.max(...arr.map(n => n.s + n.l));
    const off = max - min;
    selection.clear();
    arr.forEach(n => {
        if (n.s + off >= steps()) {
            return;
        }
        const nn = { p: n.p, s: n.s + off, l: Math.min(n.l, steps() - n.s - off) };
        curNotes().push(nn);
        selection.add(nn);
    });
    needsDraw = true;
}

function transpose(semi) {
    const list = selection.size ? [...selection] : curNotes();
    if (!list.length) {
        return;
    }
    checkpoint();
    list.forEach(n => (n.p = clamp(n.p + semi, MIN_P, MAX_P)));
    needsDraw = true;
}

function nudge(ds, dp) {
    checkpoint();
    selection.forEach(n => {
        n.s = clamp(n.s + ds, 0, steps() - 1);
        n.p = clamp(n.p + dp, MIN_P, MAX_P);
        n.l = Math.min(n.l, steps() - n.s);
    });
    if (dp) {
        previewPitch([...selection][0].p);
    }
    needsDraw = true;
}

function clearNotes() {
    checkpoint();
    P.tracks[curTrack].notes = [];
    selection.clear();
    needsDraw = true;
    toast('Cleared ' + P.tracks[curTrack].name);
}

function clearDrums() {
    checkpoint();
    drumTrack().grid.forEach(r => r.fill(0));
    needsDraw = true;
    toast('Cleared drums');
}

function doublePattern() {
    if (P.bars > 2) {
        return toast('Max length is 4 bars');
    }
    checkpoint();
    const old = steps();
    P.tracks.forEach(t => {
        if (t.kind === 'synth') {
            t.notes = t.notes.filter(n => n.s < old);
            t.notes.forEach(n => (n.l = Math.min(n.l, old - n.s)));
            t.notes.slice().forEach(n => t.notes.push({ p: n.p, s: n.s + old, l: n.l }));
        } else {
            t.grid.forEach(r => {
                for (let s = 0; s < old; s++) {
                    r[s + old] = r[s];
                }
            });
        }
    });
    P.bars *= 2;
    syncTransport();
    needsDraw = true;
    toast('Pattern doubled to ' + P.bars + ' bars');
}

function setBpm(v) {
    P.bpm = clamp(Math.round(v), 40, 240);
    $('#bpm').value = P.bpm;
    dirty = true;
}

let taps = [];

function tapTempo() {
    const n = performance.now();
    if (taps.length && n - taps[taps.length - 1] > 2000) {
        taps = [];
    }
    taps.push(n);
    if (taps.length > 1) {
        let sum = 0;
        for (let i = 1; i < taps.length; i++) {
            sum += taps[i] - taps[i - 1];
        }
        setBpm(60000 / (sum / (taps.length - 1)));
    }
    taps = taps.slice(-6);
}

function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function saveFile() {
    download(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' }), 'notebox-project.json');
    toast('Project saved');
}

function openFile() {
    $('#fileInput').click();
}

function newProject() {
    checkpoint();
    P = emptyProject();
    stop();
    afterLoad();
    toast('New project (Ctrl+Z to undo)');
}

function loadDemo() {
    checkpoint();
    P = demoProject();
    stop();
    afterLoad();
    toast('Demo loaded');
}

async function exportWav() {
    toast('Rendering WAV…');
    const st = stepDur();
    const sr = 44100;
    const total = steps() * st + 2.5;
    const off = new OfflineAudioContext(2, Math.ceil(total * sr), sr);
    const g = buildGraph(off);
    for (let s = 0; s < steps(); s++) {
        scheduleStep(g, s, s * st + swingOffset(s, st), false);
    }
    const buf = await off.startRendering();
    const ch = buf.numberOfChannels;
    const len = buf.length;
    const dv = new DataView(new ArrayBuffer(44 + len * ch * 2));
    const w = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF');
    dv.setUint32(4, 36 + len * ch * 2, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, ch, true);
    dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * ch * 2, true);
    dv.setUint16(32, ch * 2, true);
    dv.setUint16(34, 16, true);
    w(36, 'data');
    dv.setUint32(40, len * ch * 2, true);
    const data = [];
    for (let c = 0; c < ch; c++) {
        data.push(buf.getChannelData(c));
    }
    let o = 44;
    for (let i = 0; i < len; i++) {
        for (let c = 0; c < ch; c++) {
            const v = clamp(data[c][i], -1, 1);
            dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
            o += 2;
        }
    }
    download(new Blob([dv], { type: 'audio/wav' }), 'notebox-song.wav');
    toast('WAV exported');
}

function exportMidi() {
    const TPQ = 480;
    const TPS = TPQ / 4;
    const vlq = v => {
        const b = [v & 0x7f];
        while ((v >>= 7)) {
            b.unshift((v & 0x7f) | 0x80);
        }
        return b;
    };
    const chunk = (type, bytes) => {
        const n = bytes.length;
        return [...type]
            .map(c => c.charCodeAt(0))
            .concat([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255], bytes);
    };
    const trk = ev => {
        ev.sort((a, b) => a.t - b.t || a.o - b.o);
        let last = 0;
        const out = [];
        ev.forEach(e => {
            out.push(...vlq(e.t - last), ...e.d);
            last = e.t;
        });
        out.push(0, 0xff, 0x2f, 0);
        return chunk('MTrk', out);
    };
    const mpq = Math.round(60e6 / P.bpm);
    const tracks = [
        trk([
            { t: 0, o: 0, d: [0xff, 0x51, 3, (mpq >> 16) & 255, (mpq >> 8) & 255, mpq & 255] },
            { t: 0, o: 0, d: [0xff, 0x58, 4, 4, 2, 24, 8] }
        ])
    ];
    const progs = [80, 38, 89];
    P.tracks.forEach((t, i) => {
        const ev = [];
        if (t.kind === 'synth') {
            ev.push({ t: 0, o: 0, d: [0xc0 | i, progs[i] || 0] });
            t.notes
                .filter(n => n.s < steps())
                .forEach(n => {
                    const l = Math.min(n.l, steps() - n.s);
                    ev.push(
                        { t: n.s * TPS, o: 1, d: [0x90 | i, n.p, 100] },
                        { t: (n.s + l) * TPS, o: 0, d: [0x80 | i, n.p, 0] }
                    );
                });
        } else {
            DRUMS.forEach((d, r) => {
                for (let s = 0; s < steps(); s++) {
                    if (t.grid[r][s]) {
                        ev.push(
                            { t: s * TPS, o: 1, d: [0x99, d.gm, 100] },
                            { t: s * TPS + TPS / 2, o: 0, d: [0x89, d.gm, 0] }
                        );
                    }
                }
            });
        }
        tracks.push(trk(ev));
    });
    const head = chunk('MThd', [0, 1, 0, tracks.length, TPQ >> 8, TPQ & 255]);
    download(new Blob([new Uint8Array([...head, ...tracks.flat()])], { type: 'audio/midi' }), 'notebox-song.mid');
    toast('MIDI exported');
}

function buildInstrumentPanel() {
    $('#instBody').innerHTML = `
        <div class="tabs" id="trackTabs"></div>
        <div class="lbl">PRESET</div><div class="presets" id="presetList"></div>
        <div class="lbl">WAVEFORM</div><div class="waves" id="waveList"></div>
        <div class="lbl">ENVELOPE / TONE</div><div id="sliderList"></div>
        <div class="lbl">KEYBOARD OCTAVE (Z / X)</div>
        <div class="octrow"><button class="btn" id="octDown">−</button><span id="octLbl"></span><button class="btn" id="octUp">+</button></div>`;
    P.tracks.forEach((t, i) => {
        if (t.kind !== 'synth') {
            return;
        }
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = t.name;
        b.dataset.i = i;
        b.onclick = () => selectTrack(i);
        $('#trackTabs').append(b);
    });
    Object.keys(PRESETS).forEach(n => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = n.toUpperCase();
        b.dataset.p = n;
        b.onclick = () => {
            checkpoint();
            const tr = P.tracks[curTrack];
            Object.assign(tr, PRESETS[n], { preset: n });
            syncUI();
            previewPitch((S.kbOct + 1) * 12);
        };
        $('#presetList').append(b);
    });
    [
        ['square', 'SQR'],
        ['sawtooth', 'SAW'],
        ['triangle', 'TRI'],
        ['sine', 'SIN']
    ].forEach(([w, l]) => {
        const b = document.createElement('button');
        b.className = 'btn';
        b.textContent = l;
        b.dataset.w = w;
        b.onclick = () => {
            checkpoint();
            P.tracks[curTrack].wave = w;
            syncUI();
            previewPitch((S.kbOct + 1) * 12);
        };
        $('#waveList').append(b);
    });
    SLIDERS.forEach(([k, l, min, max, step, fmt]) => {
        const row = document.createElement('div');
        row.className = 'srow';
        row.innerHTML = `<span>${l}</span><input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}"><span class="v"></span>`;
        const inp = row.querySelector('input');
        inp.onpointerdown = () => checkpoint();
        inp.oninput = () => {
            P.tracks[curTrack][k] = +inp.value;
            row.querySelector('.v').textContent = fmt(+inp.value);
            dirty = true;
        };
        inp.onchange = () => previewPitch((S.kbOct + 1) * 12);
        $('#sliderList').append(row);
    });
    $('#octDown').onclick = () => setOct(-1);
    $('#octUp').onclick = () => setOct(1);
}

function setOct(d) {
    S.kbOct = clamp(S.kbOct + d, 1, 7);
    saveSettings();
    syncUI();
    toast('Keyboard octave ' + S.kbOct);
}

function buildMixer() {
    const body = $('#mixBody');
    body.innerHTML = '';
    P.tracks.forEach((t, i) => {
        const r = document.createElement('div');
        r.className = 't' + i + ' mixrow';
        r.dataset.i = i;
        r.innerHTML = `<div class="mixhead"><span class="mixname ${t.kind === 'drums' ? 'nosel' : ''}">${t.name}</span>
            <button class="mbtn" data-act="mute">M</button><button class="mbtn" data-act="solo">S</button></div>
            <div class="mixsl"><span>VOL</span><input type="range" data-k="vol" min="0" max="1" step="0.01">
            <span>PAN</span><input type="range" data-k="pan" min="-1" max="1" step="0.01"></div>`;
        body.append(r);
    });
    body.onclick = e => {
        const row = e.target.closest('.mixrow');
        if (!row) {
            return;
        }
        const i = +row.dataset.i;
        const t = P.tracks[i];
        if (e.target.dataset.act === 'mute') {
            t.mute = !t.mute;
            applyMix();
            dirty = true;
            syncUI();
        } else if (e.target.dataset.act === 'solo') {
            t.solo = !t.solo;
            applyMix();
            dirty = true;
            syncUI();
        } else if (e.target.classList.contains('mixname')) {
            selectTrack(i);
        }
    };
    body.oninput = e => {
        const row = e.target.closest('.mixrow');
        if (!row || !e.target.dataset.k) {
            return;
        }
        P.tracks[+row.dataset.i][e.target.dataset.k] = +e.target.value;
        applyMix();
        dirty = true;
    };
    body.ondblclick = e => {
        if (e.target.dataset.k === 'pan') {
            e.target.value = 0;
            P.tracks[+e.target.closest('.mixrow').dataset.i].pan = 0;
            applyMix();
            dirty = true;
        }
    };
}

function syncUI() {
    const tr = P.tracks[curTrack];
    document.querySelectorAll('#trackTabs .btn').forEach(b => b.classList.toggle('on', +b.dataset.i === curTrack));
    document.querySelectorAll('#presetList .btn').forEach(b => b.classList.toggle('on', b.dataset.p === tr.preset));
    document.querySelectorAll('#waveList .btn').forEach(b => b.classList.toggle('on', b.dataset.w === tr.wave));
    SLIDERS.forEach(([k, , , , , fmt], i) => {
        const row = $('#sliderList').children[i];
        const inp = row.querySelector('input');
        inp.value = tr[k];
        row.querySelector('.v').textContent = fmt(+tr[k]);
    });
    $('#octLbl').textContent = 'C' + S.kbOct + ' - ' + (S.kbOct + 1);
    document.querySelectorAll('.mixrow').forEach(r => {
        const i = +r.dataset.i;
        const t = P.tracks[i];
        r.classList.toggle('sel', i === curTrack);
        r.querySelector('[data-act=mute]').classList.toggle('on', t.mute);
        r.querySelector('[data-act=solo]').classList.toggle('on', !!t.solo);
        r.querySelector('[data-k=vol]').value = t.vol;
        r.querySelector('[data-k=pan]').value = t.pan;
    });
}

function selectTrack(i) {
    if (!P.tracks[i] || P.tracks[i].kind !== 'synth') {
        return;
    }
    curTrack = i;
    selection.clear();
    const n = P.tracks[i].notes;
    view.topPitch = n.length ? Math.round(n.reduce((a, x) => a + x.p, 0) / n.length) + 6 : [79, 52, 72][i] || 79;
    syncUI();
    needsDraw = true;
}

function syncTransport() {
    const pb = $('#btnPlay');
    pb.textContent = playing ? '⏸ PAUSE' : '▶ PLAY';
    pb.classList.toggle('on', playing);
    $('#btnRec').classList.toggle('on', recording);
    $('#btnLoop').classList.toggle('on', S.loop);
    $('#btnMetro').classList.toggle('on', S.metro);
    $('#bpm').value = P.bpm;
    $('#bars').value = P.bars;
    $('#noteLen').value = S.noteLen;
    $('#swing').value = Math.round(P.swing * 100);
    $('#masterVol').value = P.master;
}

function menus() {
    const tog = (l, key, after) => ({
        l,
        chk: () => S[key],
        f: () => {
            S[key] = !S[key];
            saveSettings();
            if (after) {
                after();
            }
            needsDraw = true;
        }
    });
    const setAcc = a => {
        S.acc = a;
        saveSettings();
        needsDraw = true;
    };
    return {
        File: [
            { l: 'New Project', f: newProject },
            { l: 'Open…', k: 'Ctrl+O', f: openFile },
            { l: 'Save Project', k: 'Ctrl+S', f: saveFile },
            { sep: 1 },
            { l: 'Export WAV', f: exportWav },
            { l: 'Export MIDI', f: exportMidi },
            { sep: 1 },
            { l: 'Load Demo Song', f: loadDemo }
        ],
        Edit: [
            { l: 'Undo', k: 'Ctrl+Z', f: undo },
            { l: 'Redo', k: 'Ctrl+Y', f: redo },
            { sep: 1 },
            { l: 'Cut', k: 'Ctrl+X', f: cutSel },
            { l: 'Copy', k: 'Ctrl+C', f: copySel },
            { l: 'Paste', k: 'Ctrl+V', f: pasteSel },
            { l: 'Duplicate', k: 'Ctrl+D', f: duplicateSel },
            { l: 'Delete', k: 'Del', f: deleteSel },
            { l: 'Select All', k: 'Ctrl+A', f: selectAll },
            { sep: 1 },
            {
                l: 'Transpose',
                sub: [
                    { l: '+1 semitone', f: () => transpose(1) },
                    { l: '-1 semitone', f: () => transpose(-1) },
                    { l: '+1 octave', f: () => transpose(12) },
                    { l: '-1 octave', f: () => transpose(-12) }
                ]
            },
            { l: 'Double Pattern Length', f: doublePattern },
            { sep: 1 },
            { l: 'Clear Current Track', f: clearNotes },
            { l: 'Clear Drums', f: clearDrums }
        ],
        Window: [
            ...PANELS.map(([id, l]) => ({ l, chk: () => !S.hidden[id], f: () => togglePanel(id) })),
            { sep: 1 },
            { l: 'Zoom In', k: 'Ctrl+Wheel', f: () => zoom(1.25) },
            { l: 'Zoom Out', f: () => zoom(0.8) },
            { l: 'Reset View', f: resetView },
            { sep: 1 },
            { l: 'Fullscreen', f: toggleFullscreen }
        ],
        Options: [
            {
                l: 'Accidentals',
                sub: [
                    { l: 'Sharps (C#)', chk: () => S.acc === 'sharp', f: () => setAcc('sharp') },
                    { l: 'Flats (Db)', chk: () => S.acc === 'flat', f: () => setAcc('flat') }
                ]
            },
            {
                l: 'Key',
                sub: NAMES[S.acc].map((n, i) => ({
                    l: n,
                    chk: () => S.root === i,
                    f: () => {
                        S.root = i;
                        saveSettings();
                        needsDraw = true;
                    }
                }))
            },
            {
                l: 'Scale',
                sub: Object.keys(SCALES).map(n => ({
                    l: n,
                    chk: () => S.scale === n,
                    f: () => {
                        S.scale = n;
                        saveSettings();
                        needsDraw = true;
                        toast(NAMES[S.acc][S.root] + ' ' + n);
                    }
                }))
            },
            tog('Highlight Scale', 'highlight'),
            tog('Snap to Scale', 'snapScale'),
            { sep: 1 },
            tog('Follow Playhead', 'follow'),
            tog('Loop', 'loop', syncTransport),
            tog('Metronome', 'metro', syncTransport),
            { sep: 1 },
            {
                l: 'Theme',
                sub: Object.keys(THEMES).map(n => ({ l: n, chk: () => S.theme === n, f: () => applyTheme(n) }))
            },
            tog('CRT Scanlines', 'crt', applyCrt),
            { sep: 1 },
            { l: 'Keyboard Shortcuts', k: '?', f: showShortcuts },
            { l: 'About', f: showAbout }
        ]
    };
}

function renderMenu(items) {
    const box = document.createElement('div');
    box.className = 'dropdown';
    box.onclick = e => e.stopPropagation();
    items.forEach(it => {
        if (it.sep) {
            const s = document.createElement('div');
            s.className = 'sep';
            box.append(s);
            return;
        }
        const d = document.createElement('div');
        d.className = 'mi';
        d.innerHTML = `<span class="mk">${it.chk ? (it.chk() ? '■' : '□') : ''}</span><span class="ml">${it.l}</span><span class="mk2">${it.sub ? '►' : it.k || ''}</span>`;
        if (it.sub) {
            d.classList.add('has-sub');
            const sub = renderMenu(it.sub);
            sub.classList.add('sub');
            d.append(sub);
        } else {
            d.onclick = e => {
                e.stopPropagation();
                closeMenus();
                it.f();
            };
        }
        box.append(d);
    });
    return box;
}

function closeMenus() {
    document.querySelectorAll('.menu-title.open').forEach(m => m.classList.remove('open'));
    document.querySelectorAll('.menu-title > .dropdown').forEach(d => d.remove());
}

function openMenu(el) {
    closeMenus();
    el.classList.add('open');
    el.append(renderMenu(menus()[el.dataset.menu]));
}

function initMenus() {
    document.querySelectorAll('.menu-title').forEach(el => {
        el.addEventListener('click', e => {
            e.stopPropagation();
            if (el.classList.contains('open')) {
                closeMenus();
            } else {
                openMenu(el);
            }
        });
        el.addEventListener('mouseenter', () => {
            if (document.querySelector('.menu-title.open') && !el.classList.contains('open')) {
                openMenu(el);
            }
        });
    });
    document.addEventListener('click', closeMenus);
}

function applyPanels() {
    PANELS.forEach(([id]) => $('#' + id).classList.toggle('hidden', !!S.hidden[id]));
    $('#colLeft').classList.toggle('hidden', !!(S.hidden.panelInstruments && S.hidden.panelMixer));
    $('#colRight').classList.toggle('hidden', !!(S.hidden.panelBeat && S.hidden.panelRoll));
    needsDraw = true;
}

function togglePanel(id) {
    S.hidden[id] = !S.hidden[id];
    saveSettings();
    applyPanels();
}

function zoom(f) {
    const nw = clamp(view.cellW * f, 8, 80);
    view.scrollX *= nw / view.cellW;
    view.cellW = nw;
    needsDraw = true;
}

function resetView() {
    view.cellW = 28;
    view.scrollX = 0;
    selectTrack(curTrack);
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.documentElement.requestFullscreen();
    }
}

function applyTheme(n) {
    S.theme = THEMES[n] ? n : 'Neon';
    saveSettings();
    Object.entries(THEMES[S.theme]).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    readColors();
    needsDraw = true;
}

function applyCrt() {
    document.body.classList.toggle('nocrt', !S.crt);
}

function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const g = n => cs.getPropertyValue(n).trim();
    Object.assign(C, {
        cyan: g('--neon-cyan'),
        pink: g('--neon-pink'),
        yellow: g('--neon-yellow'),
        purple: g('--neon-purple'),
        dim: g('--text-dim'),
        panel: g('--panel-bg'),
        rowA: g('--row-a'),
        rowB: g('--row-b'),
        line1: g('--line-1'),
        line2: g('--line-2'),
        line3: g('--line-3'),
        keyW: g('--key-w'),
        keyB: g('--key-b')
    });
}

let toastT;

function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

function modal(title, html) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal"><h2>${title}</h2>${html}<button class="btn">CLOSE</button></div>`;
    bg.onclick = e => {
        if (e.target === bg || e.target.tagName === 'BUTTON') {
            bg.remove();
        }
    };
    document.body.append(bg);
}

function showShortcuts() {
    modal(
        'KEYBOARD SHORTCUTS',
        `<table>
        <tr><td>Space</td><td>Play / pause</td></tr>
        <tr><td>Home</td><td>Jump to start</td></tr>
        <tr><td>A W S E D F T G Y H U J K O L P ;</td><td>Play notes (piano keys)</td></tr>
        <tr><td>Z / X</td><td>Keyboard octave down / up</td></tr>
        <tr><td>1 / 2 / 3</td><td>Select Lead / Bass / Pad</td></tr>
        <tr><td>Click grid</td><td>Add note (drag to set length)</td></tr>
        <tr><td>Drag note</td><td>Move (right edge resizes)</td></tr>
        <tr><td>Right-click</td><td>Delete note / erase drum step</td></tr>
        <tr><td>Shift+click</td><td>Add to selection</td></tr>
        <tr><td>Shift+drag</td><td>Box select</td></tr>
        <tr><td>Arrows</td><td>Nudge selection (Shift = octave)</td></tr>
        <tr><td>Del</td><td>Delete selection</td></tr>
        <tr><td>Ctrl+Z / Y</td><td>Undo / redo</td></tr>
        <tr><td>Ctrl+C / X / V / D</td><td>Copy / cut / paste / duplicate</td></tr>
        <tr><td>Ctrl+A / S / O</td><td>Select all / save / open</td></tr>
        <tr><td>Wheel</td><td>Scroll pitch (Shift = time, Ctrl = zoom)</td></tr>
        <tr><td>Click ruler</td><td>Move playhead</td></tr>
        <tr><td>Click piano key</td><td>Hear that note</td></tr>
        <tr><td>?</td><td>Show this dialog</td></tr></table>`
    );
}

function showAbout() {
    modal(
        'NOTEBOX',
        '<p>A tiny chiptune-style music maker. Everything is synthesized live with the Web Audio API. Projects autosave in your browser; use File → Save to keep a copy.</p>'
    );
}

function fitCanvas(cv) {
    const wrap = cv.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) {
        return null;
    }
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        cv.style.width = w + 'px';
        cv.style.height = h + 'px';
    }
    const c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, w, h };
}

const stepX = s => LABEL_W + s * view.cellW - view.scrollX;

function clampScroll(w) {
    const max = Math.max(0, steps() * view.cellW - (w - LABEL_W));
    view.scrollX = clamp(view.scrollX, 0, max);
}

function visRange(w) {
    return [
        Math.max(0, Math.floor(view.scrollX / view.cellW)),
        Math.min(steps(), Math.ceil((view.scrollX + w - LABEL_W) / view.cellW))
    ];
}

function vlines(c, w, y0, y1) {
    const [a, b] = visRange(w);
    for (let s = a; s <= b; s++) {
        c.fillStyle = s % 16 === 0 ? C.line3 : s % 4 === 0 ? C.line2 : C.line1;
        c.fillRect(Math.round(stepX(s)), y0, 1, y1 - y0);
    }
    const xe = stepX(steps());
    if (xe < w) {
        c.fillStyle = 'rgba(0,0,0,.5)';
        const x0 = Math.max(xe, LABEL_W);
        c.fillRect(x0, y0, w - x0, y1 - y0);
    }
}

function drawPlayhead(c, h) {
    const s = playing ? dispStep : cursor;
    const x = stepX(s);
    if (playing) {
        c.globalAlpha = 0.18;
        c.fillStyle = C.pink;
        c.fillRect(x, RULER, view.cellW, h - RULER);
        c.globalAlpha = 1;
    }
    c.fillStyle = C.pink;
    c.fillRect(x, RULER, 2, h - RULER);
}

function drawRuler(c, w) {
    c.fillStyle = C.panel;
    c.fillRect(0, 0, w, RULER);
    c.fillStyle = C.line1;
    c.fillRect(0, RULER - 1, w, 1);
    c.save();
    c.beginPath();
    c.rect(LABEL_W, 0, w - LABEL_W, RULER);
    c.clip();
    c.font = '7px "Press Start 2P", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    const [a, b] = visRange(w);
    for (let s = a; s <= b; s++) {
        const x = stepX(s);
        if (s % 16 === 0) {
            c.fillStyle = C.yellow;
            c.fillText(String(s / 16 + 1), x + 3, RULER / 2);
        } else if (s % 4 === 0) {
            c.fillStyle = C.dim;
            c.fillRect(x, RULER - 6, 1, 5);
        }
    }
    const px = stepX(playing ? dispStep : cursor);
    c.fillStyle = C.pink;
    c.beginPath();
    c.moveTo(px, RULER - 1);
    c.lineTo(px + 8, RULER - 1);
    c.lineTo(px, RULER - 9);
    c.fill();
    c.restore();
}

function noteRect(n) {
    const l = Math.min(n.l, steps() - n.s);
    return { x: stepX(n.s), y: RULER + (view.topPitch - n.p) * ROW_H, w: l * view.cellW - 1, h: ROW_H - 1 };
}

const rollCv = $('#pianoCanvas');
const beatCv = $('#beatCanvas');

function drawRoll() {
    const f = fitCanvas(rollCv);
    if (!f) {
        return;
    }
    const { c, w, h } = f;
    c.clearRect(0, 0, w, h);
    const rows = Math.floor((h - RULER) / ROW_H) + 1;
    view.topPitch = clamp(view.topPitch, Math.min(MAX_P, MIN_P + rows - 2), MAX_P);
    clampScroll(w);
    const tr = P.tracks[curTrack];
    const hl = S.highlight && S.scale !== 'Chromatic';
    c.save();
    c.beginPath();
    c.rect(LABEL_W, RULER, w - LABEL_W, h - RULER);
    c.clip();
    for (let i = 0; i < rows; i++) {
        const p = view.topPitch - i;
        if (p < MIN_P) {
            break;
        }
        const y = RULER + i * ROW_H;
        c.fillStyle = BLACK.includes(p % 12) ? C.rowB : C.rowA;
        c.fillRect(LABEL_W, y, w - LABEL_W, ROW_H);
        if (hl) {
            if (isRoot(p)) {
                c.globalAlpha = 0.2;
                c.fillStyle = C.cyan;
            } else if (inScale(p)) {
                c.globalAlpha = 0.08;
                c.fillStyle = C.cyan;
            } else {
                c.globalAlpha = 0.4;
                c.fillStyle = '#000';
            }
            c.fillRect(LABEL_W, y, w - LABEL_W, ROW_H);
            c.globalAlpha = 1;
        }
        c.fillStyle = p % 12 === 0 ? C.line3 : C.line1;
        c.fillRect(LABEL_W, y + ROW_H - 1, w - LABEL_W, 1);
    }
    vlines(c, w, RULER, h);
    P.tracks.forEach((t, ti) => {
        if (t.kind !== 'synth' || ti === curTrack) {
            return;
        }
        c.globalAlpha = 0.25;
        c.fillStyle = trackColor(ti);
        t.notes.forEach(n => {
            if (n.s >= steps()) {
                return;
            }
            const r = noteRect(n);
            c.fillRect(r.x, r.y, r.w, r.h);
        });
        c.globalAlpha = 1;
    });
    c.font = '6px "Press Start 2P", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    tr.notes.forEach(n => {
        if (n.s >= steps() || n.p > view.topPitch || n.p < view.topPitch - rows) {
            return;
        }
        const r = noteRect(n);
        if (r.x + r.w < LABEL_W || r.x > w) {
            return;
        }
        c.fillStyle = trackColor(curTrack);
        c.fillRect(r.x, r.y, r.w, r.h);
        c.fillStyle = 'rgba(255,255,255,.35)';
        c.fillRect(r.x, r.y, r.w, 2);
        if (selection.has(n)) {
            c.strokeStyle = '#fff';
            c.lineWidth = 2;
            c.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        }
        if (r.w > 26) {
            c.fillStyle = '#000';
            c.fillText(noteName(n.p), r.x + 3, r.y + ROW_H / 2);
        }
    });
    drawPlayhead(c, h);
    if (drag && drag.mode === 'marquee') {
        c.strokeStyle = C.cyan;
        c.lineWidth = 1;
        c.setLineDash([3, 3]);
        c.strokeRect(drag.x0, drag.y0, drag.x1 - drag.x0, drag.y1 - drag.y0);
        c.setLineDash([]);
    }
    c.restore();
    c.font = '7px "Press Start 2P", monospace';
    c.textBaseline = 'middle';
    for (let i = 0; i < rows; i++) {
        const p = view.topPitch - i;
        if (p < MIN_P) {
            break;
        }
        const y = RULER + i * ROW_H;
        const blk = BLACK.includes(p % 12);
        c.fillStyle = C.keyW;
        c.fillRect(0, y, LABEL_W - 1, ROW_H - 1);
        if (blk) {
            c.fillStyle = C.keyB;
            c.fillRect(0, y + 1, LABEL_W * 0.66, ROW_H - 3);
            c.fillStyle = C.keyW;
            c.textAlign = 'left';
            c.fillText(noteName(p), 4, y + ROW_H / 2);
        } else {
            c.fillStyle = '#222';
            c.textAlign = 'right';
            c.fillText(noteName(p), LABEL_W - 6, y + ROW_H / 2);
        }
        if (hl && isRoot(p)) {
            c.fillStyle = C.pink;
            c.fillRect(LABEL_W - 4, y + 3, 3, ROW_H - 7);
        }
    }
    drawRuler(c, w);
}

function drawBeat() {
    const f = fitCanvas(beatCv);
    if (!f) {
        return;
    }
    const { c, w, h } = f;
    c.clearRect(0, 0, w, h);
    clampScroll(w);
    const dt = drumTrack();
    const rh = (h - RULER) / 8;
    c.save();
    c.beginPath();
    c.rect(LABEL_W, RULER, w - LABEL_W, h - RULER);
    c.clip();
    for (let r = 0; r < 8; r++) {
        c.fillStyle = r % 2 ? C.rowB : C.rowA;
        c.fillRect(LABEL_W, RULER + r * rh, w - LABEL_W, rh);
    }
    vlines(c, w, RULER, h);
    const [a, b] = visRange(w);
    c.fillStyle = C.purple;
    for (let s = a; s < b; s++) {
        for (let r = 0; r < 8; r++) {
            if (dt.grid[r][s]) {
                c.fillRect(stepX(s) + 1, RULER + r * rh + 1, view.cellW - 2, rh - 2);
            }
        }
    }
    drawPlayhead(c, h);
    c.restore();
    c.font = '7px "Press Start 2P", monospace';
    c.textBaseline = 'middle';
    c.textAlign = 'left';
    for (let r = 0; r < 8; r++) {
        const y = RULER + r * rh;
        c.fillStyle = C.panel;
        c.fillRect(0, y, LABEL_W - 1, rh - 1);
        c.fillStyle = C.purple;
        c.fillText(DRUMS[r].label, 4, y + rh / 2);
    }
    drawRuler(c, w);
}

let drag = null;
let paint = null;
let heldPrev = null;

function rollCoords(e) {
    const r = rollCv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    return {
        x,
        y,
        col: (x - LABEL_W + view.scrollX) / view.cellW,
        pitch: view.topPitch - Math.floor((y - RULER) / ROW_H)
    };
}

function beatCoords(e) {
    const r = beatCv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rh = (r.height - RULER) / 8;
    return {
        x,
        y,
        col: (x - LABEL_W + view.scrollX) / view.cellW,
        row: Math.floor((y - RULER) / rh)
    };
}

function findNote(col, pitch) {
    const ns = curNotes();
    for (let i = ns.length - 1; i >= 0; i--) {
        const n = ns[i];
        if (n.p === pitch && col >= n.s && col < n.s + n.l) {
            return n;
        }
    }
    return null;
}

rollCv.addEventListener('mousedown', e => {
    if (e.button !== 0) {
        return;
    }
    ensureAudio();
    const { x, y, col, pitch } = rollCoords(e);
    const tr = P.tracks[curTrack];
    const nl = S.noteLen;
    if (y < RULER) {
        if (x >= LABEL_W) {
            seek(Math.floor(col));
        }
        return;
    }
    if (x < LABEL_W) {
        if (pitch >= MIN_P && pitch <= MAX_P) {
            heldPrev = voice(audioCtx, live.buses[curTrack].gain, tr, pitch, audioCtx.currentTime, null, 0.9);
        }
        return;
    }
    if (pitch < MIN_P || pitch > MAX_P || col < 0 || col >= steps()) {
        return;
    }
    const n = findNote(col, pitch);
    if (n) {
        if (e.shiftKey && selection.has(n)) {
            selection.delete(n);
            needsDraw = true;
            return;
        }
        if (!selection.has(n)) {
            if (!e.shiftKey) {
                selection.clear();
            }
            selection.add(n);
        }
        drag = {
            mode: (n.s + n.l - col) * view.cellW < 7 ? 'resize' : 'move',
            startCol: col,
            startPitch: pitch,
            anchor: n,
            lastP: n.p,
            cp: false,
            orig: [...selection].map(m => ({ n: m, s: m.s, p: m.p, l: m.l }))
        };
        previewPitch(n.p);
    } else if (e.shiftKey) {
        drag = { mode: 'marquee', x0: x, y0: y, x1: x, y1: y };
    } else {
        selection.clear();
        checkpoint();
        const p = snapPitch(pitch);
        const s = Math.floor(col / nl) * nl;
        const nn = { p, s, l: Math.min(nl, steps() - s) };
        tr.notes.push(nn);
        selection.add(nn);
        drag = { mode: 'resize', startCol: col, anchor: nn, cp: true, orig: [{ n: nn, s: nn.s, p: nn.p, l: nn.l }] };
        previewPitch(p);
    }
    needsDraw = true;
});

rollCv.addEventListener('contextmenu', e => {
    e.preventDefault();
    const { x, y, col, pitch } = rollCoords(e);
    if (x < LABEL_W || y < RULER) {
        return;
    }
    const n = findNote(col, pitch);
    if (n) {
        checkpoint();
        const tr = P.tracks[curTrack];
        tr.notes = tr.notes.filter(m => m !== n);
        selection.delete(n);
        needsDraw = true;
    }
});

function rollDrag(e) {
    const q = rollCoords(e);
    const nl = S.noteLen;
    if (drag.mode === 'marquee') {
        drag.x1 = q.x;
        drag.y1 = q.y;
        needsDraw = true;
        return;
    }
    const dStep = Math.round((q.col - drag.startCol) / nl) * nl;
    const dP = q.pitch - drag.startPitch;
    if (!drag.cp) {
        if (drag.mode === 'move' && !dStep && !dP) {
            return;
        }
        if (drag.mode === 'resize' && !dStep) {
            return;
        }
        checkpoint();
        drag.cp = true;
    }
    for (const o of drag.orig) {
        const n = o.n;
        if (drag.mode === 'move') {
            n.s = clamp(o.s + dStep, 0, steps() - 1);
            n.p = clamp(snapPitch(o.p + dP), MIN_P, MAX_P);
            n.l = Math.min(o.l, steps() - n.s);
        } else {
            n.l = clamp(o.l + dStep, 1, steps() - o.s);
        }
    }
    if (drag.mode === 'move' && drag.anchor.p !== drag.lastP) {
        drag.lastP = drag.anchor.p;
        previewPitch(drag.anchor.p);
    }
    needsDraw = true;
    dirty = true;
}

function finishMarquee() {
    const x0 = Math.min(drag.x0, drag.x1);
    const x1 = Math.max(drag.x0, drag.x1);
    const y0 = Math.min(drag.y0, drag.y1);
    const y1 = Math.max(drag.y0, drag.y1);
    curNotes().forEach(n => {
        if (n.s >= steps()) {
            return;
        }
        const r = noteRect(n);
        if (r.x < x1 && r.x + r.w > x0 && r.y < y1 && r.y + r.h > y0) {
            selection.add(n);
        }
    });
}

function paintCell(row, step) {
    if (row < 0 || row > 7 || step < 0 || step >= steps()) {
        return;
    }
    const grid = drumTrack().grid;
    if (grid[row][step] === paint.val) {
        return;
    }
    if (!paint.cp) {
        checkpoint();
        paint.cp = true;
    }
    grid[row][step] = paint.val;
    if (paint.val) {
        previewDrum(row);
    }
    dirty = true;
    needsDraw = true;
}

beatCv.addEventListener('mousedown', e => {
    if (e.button !== 0 && e.button !== 2) {
        return;
    }
    ensureAudio();
    const { x, y, col, row } = beatCoords(e);
    if (y < RULER) {
        if (x >= LABEL_W && e.button === 0) {
            seek(Math.floor(col));
        }
        return;
    }
    if (row < 0 || row > 7) {
        return;
    }
    if (x < LABEL_W) {
        if (e.button === 0) {
            previewDrum(row);
        }
        return;
    }
    const step = Math.floor(col);
    if (step < 0 || step >= steps()) {
        return;
    }
    paint = { val: e.button === 2 || drumTrack().grid[row][step] ? 0 : 1, cp: false };
    paintCell(row, step);
});

beatCv.addEventListener('contextmenu', e => e.preventDefault());

function onWheel(e, isRoll) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
        zoom(e.deltaY < 0 ? 1.25 : 0.8);
    } else if (e.shiftKey || !isRoll) {
        view.scrollX += e.deltaY || e.deltaX;
    } else {
        view.topPitch -= Math.sign(e.deltaY) * 2;
    }
    needsDraw = true;
}

rollCv.addEventListener('wheel', e => onWheel(e, true), { passive: false });
beatCv.addEventListener('wheel', e => onWheel(e, false), { passive: false });

window.addEventListener('mousemove', e => {
    if (drag) {
        rollDrag(e);
    } else if (paint) {
        const { col, row } = beatCoords(e);
        paintCell(row, Math.floor(col));
    }
});

window.addEventListener('mouseup', () => {
    if (drag && drag.mode === 'marquee') {
        finishMarquee();
    }
    drag = null;
    paint = null;
    if (heldPrev) {
        heldPrev.release(audioCtx.currentTime);
        heldPrev = null;
    }
    needsDraw = true;
});

window.addEventListener('blur', releaseAllLive);

document.addEventListener('keydown', e => {
    const t = e.target;
    if (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && t.type !== 'range')) {
        if (e.key === 'Escape') {
            t.blur();
        }
        return;
    }
    if (e.ctrlKey || e.metaKey) {
        const k = e.key.toLowerCase();
        const run = f => {
            e.preventDefault();
            f();
        };
        switch (k) {
            case 'z':
                run(e.shiftKey ? redo : undo);
                break;
            case 'y':
                run(redo);
                break;
            case 'c':
                run(copySel);
                break;
            case 'x':
                run(cutSel);
                break;
            case 'v':
                run(pasteSel);
                break;
            case 'd':
                run(duplicateSel);
                break;
            case 'a':
                run(selectAll);
                break;
            case 's':
                run(saveFile);
                break;
            case 'o':
                run(openFile);
                break;
        }
        return;
    }
    if (e.altKey) {
        return;
    }
    if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) {
            togglePlay();
        }
        return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSel();
        return;
    }
    if (e.key === 'Escape') {
        closeMenus();
        selection.clear();
        document.querySelectorAll('.modal-bg').forEach(m => m.remove());
        needsDraw = true;
        return;
    }
    if (e.key === 'Home') {
        seek(0);
        return;
    }
    if (e.key === '?') {
        showShortcuts();
        return;
    }
    if (e.key.startsWith('Arrow') && selection.size) {
        e.preventDefault();
        const nl = S.noteLen;
        if (e.key === 'ArrowLeft') {
            nudge(-nl, 0);
        } else if (e.key === 'ArrowRight') {
            nudge(nl, 0);
        } else {
            nudge(0, (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 12 : 1));
        }
        return;
    }
    const k = e.key.toLowerCase();
    if (k === 'z') {
        setOct(-1);
        return;
    }
    if (k === 'x') {
        setOct(1);
        return;
    }
    if (/^[1-3]$/.test(k)) {
        selectTrack(+k - 1);
        return;
    }
    if (isKey(k) && !held.has(k) && !e.repeat) {
        startLive(k);
    }
});

document.addEventListener('keyup', e => releaseLive(e.key.toLowerCase()));

document.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON') {
        e.target.blur();
    }
});

function updateTimeDisplay(s) {
    const bar = Math.floor(s / 16) + 1;
    const beat = Math.floor((s % 16) / 4) + 1;
    const sub = (s % 4) + 1;
    $('#timeDisp').textContent = `${bar}:${beat}:${sub}`;
}

function frame() {
    if (playing) {
        const now = audioCtx.currentTime;
        while (queue.length && queue[0].time <= now) {
            const q = queue.shift();
            dispStep = q.step;
            dispTime = q.time;
        }
        if (S.follow) {
            const vw = rollCv.parentElement.clientWidth - LABEL_W;
            const x = dispStep * view.cellW;
            if (x < view.scrollX || x + view.cellW > view.scrollX + vw) {
                view.scrollX = x;
            }
        }
        updateTimeDisplay(dispStep);
        needsDraw = true;
    } else {
        updateTimeDisplay(cursor);
    }
    if (needsDraw) {
        needsDraw = false;
        drawBeat();
        drawRoll();
    }
    requestAnimationFrame(frame);
}

function initTransport() {
    $('#btnPlay').onclick = togglePlay;
    $('#btnStop').onclick = stop;
    $('#btnRec').onclick = () => {
        recording = !recording;
        syncTransport();
        if (recording && !playing) {
            toast('REC armed: press play, then play the keyboard');
        }
    };
    $('#btnLoop').onclick = () => {
        S.loop = !S.loop;
        saveSettings();
        syncTransport();
    };
    $('#btnMetro').onclick = () => {
        S.metro = !S.metro;
        saveSettings();
        syncTransport();
    };
    $('#btnTap').onclick = tapTempo;
    $('#bpm').onchange = e => setBpm(+e.target.value || 110);
    $('#bars').onchange = e => {
        checkpoint();
        P.bars = +e.target.value;
        if (cursor >= steps()) {
            cursor = 0;
        }
        needsDraw = true;
    };
    $('#noteLen').onchange = e => {
        S.noteLen = +e.target.value;
        saveSettings();
    };
    $('#swing').oninput = e => {
        P.swing = e.target.value / 100;
        dirty = true;
    };
    $('#masterVol').oninput = e => {
        P.master = +e.target.value;
        applyMix();
        dirty = true;
    };
    $('#zoomIn').onclick = () => zoom(1.25);
    $('#zoomOut').onclick = () => zoom(0.8);
    $('#defaultZoom').onclick = resetView;
    $('#fileInput').onchange = e => {
        const f = e.target.files[0];
        if (!f) {
            return;
        }
        const rd = new FileReader();
        rd.onload = () => {
            try {
                const np = normalize(JSON.parse(rd.result));
                checkpoint();
                P = np;
                stop();
                afterLoad();
                toast('Project loaded');
            } catch {
                toast('Not a valid Notebox project');
            }
        };
        rd.readAsText(f);
        e.target.value = '';
    };
}

window.addEventListener('load', () => {
    try {
        P = normalize(JSON.parse(localStorage.getItem('notebox-project')));
        toast('Restored last session');
    } catch {
        P = demoProject();
    }
    applyTheme(S.theme);
    applyCrt();
    applyPanels();
    buildInstrumentPanel();
    buildMixer();
    initMenus();
    initTransport();
    selectTrack(0);
    syncTransport();
    new ResizeObserver(() => {
        needsDraw = true;
    }).observe($('#panelRoll'));
    new ResizeObserver(() => {
        needsDraw = true;
    }).observe($('#panelBeat'));
    if (document.fonts) {
        document.fonts.ready.then(() => {
            needsDraw = true;
        });
    }
    frame();
});
