const circle = document.getElementById('circle');
const guideText = document.getElementById('guide-text');
const timerText = document.getElementById('timer-text');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const tickSound = document.getElementById('tick-sound');
const phaseSound = document.getElementById('phase-sound');

const phases = [
    { name: '흡입', duration: 4, className: 'grow' },
    { name: '유지', duration: 7, className: 'hold' },
    { name: '배출', duration: 8, className: 'shrink' }
];

let currentPhaseIndex = 0;
let timerInterval = null;
let remainingTime = 0;

function playSound(audioElement) {
    audioElement.currentTime = 0; // Rewind to the start
    audioElement.play().catch(error => {
        // Autoplay might be blocked, user interaction is needed
        console.warn("Audio playback failed:", error);
        // Optionally, inform the user they need to interact first
    });
}

function updateUI() {
    const currentPhase = phases[currentPhaseIndex];
    guideText.textContent = currentPhase.name;
    remainingTime = currentPhase.duration;
    timerText.textContent = remainingTime;

    // Update circle animation class
    circle.className = ''; // Reset classes first
    // Add a small delay before adding the new class to ensure transition restarts
    setTimeout(() => {
        circle.classList.add(currentPhase.className);
        // Set transition durations dynamically based on phase
        circle.style.transitionDuration = `${currentPhase.duration}s, ${currentPhase.duration}s, 0.5s`; // width, height, background-color
    }, 10); // Small delay like 10ms

    // Play phase change sound only when transitioning between phases, not on initial start
    if (timerInterval) { // Check if the timer is already running
         playSound(phaseSound);
    }
}

function tick() {
    // Check if the *current* time is 0, meaning the phase should change now
    if (remainingTime === 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        updateUI(); // updateUI resets remainingTime and displays it
        // Play tick sound for the start of the new phase's countdown
        playSound(tickSound);
    } else {
        // If not changing phase, decrement the time, display it, and play sound
        remainingTime--;
        timerText.textContent = remainingTime;
        playSound(tickSound);
    }
}

function startBreathing() {
    if (timerInterval) return; // Prevent multiple intervals

    // Reset to the first phase and update UI immediately
    currentPhaseIndex = 0;
    updateUI();

    // Start the timer interval after the initial UI update
    timerInterval = setInterval(tick, 1000);

    startButton.disabled = true;
    stopButton.disabled = false;
}

function stopBreathing() {
    if (!timerInterval) return; // Already stopped

    clearInterval(timerInterval);
    timerInterval = null;

    // Reset UI to initial state
    guideText.textContent = '시작하세요';
    timerText.textContent = '';
    circle.className = ''; // Remove animation classes
    circle.style.transitionDuration = '0.5s, 0.5s, 0.5s'; // Reset transition duration

    // Stop sounds
    tickSound.pause();
    tickSound.currentTime = 0;
    phaseSound.pause();
    phaseSound.currentTime = 0;

    currentPhaseIndex = 0;
    remainingTime = 0;

    startButton.disabled = false;
    stopButton.disabled = true;
}

// Initial state setup
stopButton.disabled = true; // Stop button disabled initially
startButton.addEventListener('click', startBreathing);
stopButton.addEventListener('click', stopBreathing);

// Ensure sounds are loaded - might require user interaction on some browsers
document.addEventListener('click', () => {
    tickSound.load();
    phaseSound.load();
}, { once: true });
