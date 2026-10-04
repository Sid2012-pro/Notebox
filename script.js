const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const canvas = document.getElementById('beatCanvas');
const ctx = canvas.getContext('2d');
const grid = Array(8).fill(0).map(() => Array(8).fill(false));
const freqs = [523, 493, 440, 392, 349, 329, 293, 261];
let step = 0;

canvas.addEventListener('click', (e) => {
    const r = Math.floor((e.clientY - canvas.getBoundingClientRect().top) / (canvas.height / 8));
    const c = Math.floor((e.clientX - canvas.getBoundingClientRect().left) / (canvas.width / 8));
    grid[r][c] = !grid[r][c];
});

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            ctx.fillStyle = grid[r][c] ? '#00ffcc' : (c === step ? '#444' : '#111');
            ctx.fillRect(c * (canvas.width / 8), r * (canvas.height / 8), canvas.width / 8 - 2, canvas.height / 8 - 2);
            if (grid[r][step] && c === step) play(freqs[r]);
        }
    }
    step = (step + 1) % 8;
}, 200);

function play(freq) {
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.15);
}