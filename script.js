// Display elements
const timerDisplay = document.getElementById('timer');
const modeLabel = document.getElementById('mode-label');

// Control buttons
const startBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const forwardBtn = document.getElementById('forward-btn');

// Mode buttons
const modeBtns = document.querySelectorAll('.mode-switch button');

// Session Count
const sessionCountDisplay = document.getElementById('session-count');

// Audio elements
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/phone_alerts_and_rings.ogg');

// Ambient sound options matching HTML data-sound attributes
const ambientSounds = {
    rain: new Audio('./ambient sounds/rain.mp3'),
    forest: new Audio('./ambient sounds/forest.mp3'),
    cafe: new Audio('./ambient sounds/cafe.mp3'),
    ocean: new Audio('./ambient sounds/ocean.mp3'),
    lofi: new Audio('./ambient sounds/lofi.mp3')
};

const themeCards = document.querySelectorAll('.theme-card');

//Settings Modal
const modal = document.getElementById('settings-modal');
const settingBtn = document.querySelector('.settings-btn');
const closeBtm =document.getElementById('close-modal-button');

// Configure ambient sounds to loop continuously
Object.values(ambientSounds).forEach(sound => {
    sound.loop = true;
});

// Timer State
let timeLeft = 1500; // 25 minutes in seconds
let isRunning = false;
let timerId = null;
let currentModeDuration = 1500; // Default Focus duration
let sessionCount = 0;

// Ambient Sound State
let currentSoundKey = 'silence'; // Default mode
let currentAmbientSound = null;

// Target .sound-btn selector matching HTML
const soundButtons = document.querySelectorAll('.sound-btn');

// SVG Icons for Play/Pause button toggle
const playIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
const pauseIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>`;

// Update digital clock display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Dynamically toggle Play/Pause SVG icon
function updatePlayPauseIcon() {
    startBtn.innerHTML = isRunning ? pauseIconSVG : playIconSVG;
}

// Ambient Sound Controls
function playAmbientSound() {
    if (currentSoundKey !== 'silence' && ambientSounds[currentSoundKey]) {
        currentAmbientSound = ambientSounds[currentSoundKey];
        currentAmbientSound.play().catch(err => {
            console.warn("Playback blocked by browser autoplay policy:", err);
        });
    }
}

function stopAmbientSound() {
    if (currentAmbientSound) {
        currentAmbientSound.pause();
        currentAmbientSound.currentTime = 0;
        currentAmbientSound = null;
    }
}

// Timer Logic
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    updatePlayPauseIcon();
    playAmbientSound();
    
    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft === 0) {
            pauseTimer();
            alarmSound.play();
            
            // Increment completed sessions on Focus mode completion
            if (currentModeDuration === 1500) { 
                sessionCount++;
                sessionCountDisplay.textContent = `${sessionCount} sessions`;
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    updatePlayPauseIcon();
    stopAmbientSound();
}

// Event Listeners: Play / Pause
startBtn.addEventListener('click', () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}); 

// Event Listeners: Reset Button
resetBtn.addEventListener('click', () => {
    pauseTimer();
    timeLeft = currentModeDuration;
    updateDisplay();
});

// Event Listeners: Fast Forward / Skip Button
if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
        pauseTimer();
        timeLeft = 0;
        updateDisplay();
        alarmSound.play();
    });
}

// Event Listeners: Mode Switching (Focus, Short Break, Long Break)
modeBtns.forEach(button => {
    button.addEventListener('click', () => {
        pauseTimer();
        currentModeDuration = parseInt(button.getAttribute('data-time'));
        timeLeft = currentModeDuration;
        modeLabel.textContent = button.textContent.toUpperCase();
        updateDisplay();

        modeBtns.forEach(btn => btn.className = 'mode-button');
        button.className = 'mode-button-active';
    });
});

// Event Listeners: Ambient Sound Buttons
// Event Listeners: Ambient Sound Buttons
soundButtons.forEach(button => {
    button.addEventListener('click', () => {
        const soundKey = button.getAttribute('data-sound');

        // Toggle visual active state
        soundButtons.forEach(btn => btn.classList.remove('sound-btn-active', 'active'));
        button.classList.add('sound-btn-active');

        // Stop current track
        stopAmbientSound();
        currentSoundKey = soundKey;

        // Directly play audio on click if a sound was selected
        if (currentSoundKey !== 'silence') {
            playAmbientSound();
        }
    });
});

//Open Settings Menu
settingBtn.addEventListener('click',() =>{
    modal.classList.add('open');
});

//Close the Settings Menu
closeBtm.addEventListener('click',()=>{
    modal.classList.remove('open');
});

//Close when background clicked
modal.addEventListener('click',(e)=>{
    if( e.target===modal){
        modal.classList.remove('open'); 
    }
});

themeCards.forEach(card =>{
    card.addEventListener('click',()=>{
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const selectedTheme = card.dataset.theme;
        document.body.setAttribute('data-theme',selectedTheme);
    });
});

//Timer Durations

function setupStepper(minusId, plusId, valId, modeIndex){
    const minusBtn = document.getElementById(minusId);
    const plusBtn = document.getElementById(plusId);
    const valDisplay = document.getElementById(valId);
    const targetModeBtn = modeBtns[modeIndex];

    if(!minusBtn || !plusBtn || !valDisplay || !targetModeBtn) return;

    function updateDuration(newMinutes){
        if(newMinutes<1 || newMinutes>60) return;
        valDisplay.textContent = `${newMinutes}m`;

        const newSeconds = newMinutes * 60;
        targetModeBtn.setAttribute('data-time', newSeconds);

        const isActiveMode = targetModeBtn.classList.contains('mode-button-active');
        if(isActiveMode){
            currentModeDuration = newSeconds;
            if(!isRunning){
                timeLeft = newSeconds;
                updateDisplay();
            }
        }
    }

    minusBtn.addEventListener('click', ()=>{
        let currMins = parseInt(valDisplay.textContent.replace(/\D/g, ''), 10);
        updateDuration(currMins - 1);
    });

    plusBtn.addEventListener('click', ()=>{
        let currMins = parseInt(valDisplay.textContent.replace(/\D/g, ''), 10);
        updateDuration(currMins + 1);
    });
}

setupStepper('focus-minus','focus-plus','focus-val',0);
setupStepper('short-break-minus','short-break-plus','short-break-val',1);
setupStepper('long-break-minus','long-break-plus','long-break-val',2);

// RESET SESSIONS BUTTON (Bonus)
const resetSessionsBtn = document.getElementById('reset-sessions-btn');
const completedCount = document.getElementById('completed-count');

if (resetSessionsBtn) {
    resetSessionsBtn.addEventListener('click', () => {
        sessionCount = 0;
        sessionCountDisplay.textContent = '0 sessions';
        if (completedCount) {
            completedCount.textContent = '0';
        }
    });
}


