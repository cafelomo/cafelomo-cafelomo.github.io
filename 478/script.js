document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const breathContainer = document.querySelector('.breath-container');
    const progressDot = document.querySelector('.progress-dot');
    const phaseNameDisplay = document.getElementById('phase-name');
    const timeLeftDisplay = document.getElementById('time-left');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');

    // Breathing Phases Configuration
    const phases = [
        { name: '들이마시기', duration: 4, color: '#4CAF50' }, // Inhale
        { name: '참기', duration: 7, color: '#FFC107' },       // Hold
        { name: '내쉬기', duration: 8, color: '#2196F3' },     // Exhale
    ];
    const totalCycleDuration = phases.reduce((sum, phase) => sum + phase.duration, 0); // 19 seconds

    // State Variables
    let isRunning = false;
    let currentPhaseIndex = 0;
    let timeElapsedInPhase = 0;
    let totalTimeElapsedInCycle = 0; // Tracks time within the current 19s cycle for dot position
    let animationFrameId = null;
    let lastTimestamp = 0;

    // --- Initialization ---
    function resetState() {
        isRunning = false;
        currentPhaseIndex = 0;
        timeElapsedInPhase = 0;
        totalTimeElapsedInCycle = 0;
        lastTimestamp = 0;

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Reset displays to initial state
        phaseNameDisplay.textContent = "시작하세요";
        timeLeftDisplay.textContent = phases[0].duration; // Show initial phase duration
        updateDotPosition(0); // Reset dot to 12 o'clock

        // Reset button states
        startButton.disabled = false;
        stopButton.disabled = true;
    }

    // --- Timer and Display Update ---
    function updateTimerDisplay(phaseName, timeLeft) {
        phaseNameDisplay.textContent = phaseName;
        // Display the ceiling of the time left (e.g., 4, 3, 2, 1)
        timeLeftDisplay.textContent = Math.max(0, Math.ceil(timeLeft));
    }

    // --- Dot Position Update ---
    function updateDotPosition(elapsedCycleTime) {
        // Calculate the angle based on the proportion of time elapsed in the total cycle
        const angleRatio = (elapsedCycleTime % totalCycleDuration) / totalCycleDuration;
        // Angle in degrees: 0 degrees at 3 o'clock, needs offset for 12 o'clock start (-90 deg)
        const angleDegrees = angleRatio * 360 - 90;
        const angleRadians = angleDegrees * (Math.PI / 180);

        // Calculate dot position on the circle circumference
        const radius = breathContainer.offsetWidth / 2; // Outer radius
        const dotSize = progressDot.offsetWidth;
        const dotOffset = dotSize / 2; // To center the dot on the line

        // Center coordinates of the container
        const centerX = radius;
        const centerY = radius;

        // Calculate the top-left coordinates for the dot
        const dotX = centerX + radius * Math.cos(angleRadians) - dotOffset;
        const dotY = centerY + radius * Math.sin(angleRadians) - dotOffset;

        // Apply the calculated position
        progressDot.style.left = `${dotX}px`;
        progressDot.style.top = `${dotY}px`;
    }

    // --- Animation Loop (Main Logic) ---
    function animationLoop(timestamp) {
        if (!isRunning) return; // Stop loop if not running

        if (lastTimestamp === 0) {
            lastTimestamp = timestamp; // Initialize timestamp on first frame
        }
        // Calculate time elapsed since the last frame in seconds
        const deltaTime = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp; // Update timestamp for the next frame

        // Update total time elapsed in the cycle and within the current phase
        totalTimeElapsedInCycle += deltaTime;
        timeElapsedInPhase += deltaTime;

        const currentPhase = phases[currentPhaseIndex];

        // Check if the current phase has completed
        if (timeElapsedInPhase >= currentPhase.duration) {
            // Move to the next phase
            timeElapsedInPhase -= currentPhase.duration; // Carry over extra time
            currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
            // No need to adjust totalTimeElapsedInCycle here, it tracks the overall cycle progress
        }

        // Update the timer display for the current (or new) phase
        const timeLeftInPhase = phases[currentPhaseIndex].duration - timeElapsedInPhase;
        updateTimerDisplay(phases[currentPhaseIndex].name, timeLeftInPhase);

        // Update the dot's position based on the total time elapsed in the cycle
        updateDotPosition(totalTimeElapsedInCycle);

        // Request the next frame to continue the animation
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    // --- Control Functions ---
    function startBreathing() {
        if (isRunning) return; // Prevent multiple starts
        isRunning = true;
        startButton.disabled = true;
        stopButton.disabled = false;

        // Reset time tracking for a fresh start
        currentPhaseIndex = 0;
        timeElapsedInPhase = 0;
        totalTimeElapsedInCycle = 0; // Start cycle from the beginning
        lastTimestamp = 0; // Reset timestamp for accurate delta time calculation

        updateTimerDisplay(phases[0].name, phases[0].duration); // Show first phase info
        updateDotPosition(0); // Ensure dot starts at 12 o'clock

        // Start the animation loop
        animationFrameId = requestAnimationFrame(animationLoop);
    }

    function stopBreathing() {
        if (!isRunning) return; // Prevent multiple stops
        // Reset state completely when stopped
        resetState();
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', startBreathing);
    stopButton.addEventListener('click', stopBreathing);

    // --- Initial Setup ---
    resetState(); // Initialize the application state on page load
});
