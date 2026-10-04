let audioCtx = null;
const canvas = document.getElementById('beatCanvas');
const ctx = canvas.getContext('2d');
const grid = Array(8).fill(0).map(() => Array(8).fill(false));
const freqs = [523, 493, 440, 392, 349, 329, 293, 261];
let step = 0;
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width - 20;
    canvas.height = rect.height - 30;
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('click', (e) => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (canvas.width / 8));
    const row = Math.floor(y / (canvas.height / 8));

    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        grid[row][col] = !grid[row][col];
        if (grid[row][col]) play(freqs[row]);
    }
});
setInterval(() => {
    if (!canvas.width || !canvas.height) return;

    const cellW = canvas.width / 8;
    const cellH = canvas.height / 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            ctx.fillStyle = grid[r][c] ? '#00ffcc' : (c === step ? '#2a2e45' : '#121420');
            ctx.fillRect(c * cellW, r * cellH, cellW - 2, cellH - 2);

            if (grid[r][step] && c === step && audioCtx) {
                play(freqs[r]);
            }
        }
    }
    step = (step + 1) % 8;
}, 200);

function play(freq) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}