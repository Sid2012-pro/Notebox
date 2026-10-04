let audioCtx = null;
const canvas = document.getElementById('beatCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 16;
const COLS = 16;
const grid = Array(ROWS).fill(0).map(() => Array(COLS).fill(false));

const noteLabels = [
    'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3', 'B2'
];
const freqs = [
    523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 246.94, 220.00, 196.00, 174.61, 164.81, 146.83, 130.81, 123.47
];

let step = 0;
let isPlaying = false;
let intervalId = null;
let bpm = 120;
