let audioCtx = null;
const canvas = document.getElementById('beatCanvas');
const ctx = canvas.getContext('2d');
const ROWS = 16;
const COLS = 16;
const grid = Array(ROWS).fill(0).map(() => Array(COLS).fill(false));

const noteLabels = [
    'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4',
    'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3', 'B2'
];
const freqs = [
    523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63,
    246.94, 220.00, 196.00, 174.61, 164.81, 146.83, 130.81, 123.47
];

let step = 0;
let isPlaying = false;
let intervalId = null;
let bpm = 120;
const LABEL_WIDTH = 45;

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 20;
    canvas.height = rect.height - 30;
    draw();
}
window.addEventListener('load', () => {
    resizeCanvas();
    initUIControls();
});
window.addEventListener('resize', resizeCanvas);

function draw() {
    if (!canvas.width || !canvas.height) return;
    const gridWidth = canvas.width - LABEL_WIDTH;
    const cellW = gridWidth / COLS;
    const cellH = canvas.height / ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        ctx.fillStyle = "#ffcc00"
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseLine = 'middle';
        ctx.fillText(noteLabels[r], LABEL_WIDTH - 8, r * cellH + cellH / 2);
        for (let c = 0; c < COLS; c++) {
            const x = LABEL_WIDTH + c * cellW;
            const y = r * cellH;
            ctx.fillStyle = grid[r][c] ? '#00ffcc' : (c === step && isPlaying ? '#2a2e45' : "#121420");
            ctx.fillRect(x, y, cellW - 2, cellH - 2);
            if (isPlaying && c === step) {
                ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
                ctx.fillRect(x, 0, cellW, canvas.height);
            }
        }
    }
}

canvas.addEventListener('click', (e) => {
    initAudioContext();
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - LABEL_WIDTH;
    const y = e.clientY - rect.top;
    const gridWidth = canvas.width - LABEL_WIDTH;
    const col = Math.floor(x / (gridWidth / COLS));
    const row = Math.floor(y / (canvas.height / ROWS));
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        grid[row][col] = !grid[row][col];
        if (grid[row][col]) play(freqs[row]);
        draw();
    }
});

function tick() {
    for (let r = 0; r < ROWS; r++) {
        if (grid[r][step]) {
            play(freqs[r])
        }
    }
    draw();
    step = (step + 1) % COLS;
}

function play(freq) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function initAudioContext() {
    if (!audioCtx) {
        audioCtx.new(window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function togglePlay() {
    initAudioContext();
    isPlaying = !isPlaying;
    const playBtn = document.getElementById('playBtn');
    if (isPLaying) {
        if (playBtn) {
            playBtn.textContent = '⏸ PAUSE';
            playBtn.style.background = "#00ffcc";
            playBtn.style.color = '#000';
        }
        intervalId = setInterval(tick, (60 / bpm / 4) * 1000);
    } else {
        if (playBtn) {
            playBtn.textContent = '▶ PLAY';
            playBtn.style.background = '#ff0055';
            playBtn.style.color = '#fff';
        }
        clearInterval(intervalId);
        step = 0;
        draw();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    }
})

function initUIControls() {
    const instSelector = document.querySelector('.InstrumentSelector');
    if (instSelector) {
        instSelector.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                <button id="playBtn" style="padding:10px; background:#ff0055; color:#fff; border:none; font-family:inherit; cursor:pointer;">▶ PLAY</button>
            </div>
        `;
        document.getElementById('playBtn').addEventListener('click', togglePlay);
    }
}