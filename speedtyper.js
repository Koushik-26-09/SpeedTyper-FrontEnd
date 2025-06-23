const quoteDisplay = document.getElementById('quoteDisplay');
const typingInput = document.getElementById('typingInput');
const startButton = document.getElementById('startButton');
const buttonText = document.getElementById('buttonText');
const timer = document.getElementById('timer');
const wpmValue = document.getElementById('wpmValue');
const accuracyValue = document.getElementById('accuracyValue');
const charactersValue = document.getElementById('charactersValue');
const progressBar = document.getElementById('progressBar');
const modeToggle = document.getElementById('modeToggle');
const completionSound = document.getElementById('completionSound');
const previousScore = document.getElementById('previousScore');
const viewContainer = document.getElementById('viewContainer');
const viewScoresBtn = document.getElementById('viewScoresBtn');

function saveScore(wpm, accuracy, timeTaken, charCount) {
    const score = {
        wpm: wpm,
        accuracy: accuracy,
        time: timeTaken,
        characters: charCount
    };
    localStorage.setItem("previousScore", JSON.stringify(score));
}

let currentQuote = '';
let startTime = null;
let timerInterval = null;
let isTestActive = false;
let totalCharacters = 0;
let correctCharacters = 0;


const sampleQuotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Life is what happens when you're busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop."
];


async function fetchRandomQuote() {
    try {
        buttonText.innerHTML = '<span class="loading-spinner"></span>Loading...';
        const response = await fetch('https://apis.ccbp.in/random-quote');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('Error fetching quote:', error);

        return sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)];
    } finally {
        buttonText.textContent = 'Start Test';
    }
}

async function startTest() {

    startTime = null;
    clearInterval(timerInterval);
    wpmValue.textContent = '0';
    accuracyValue.textContent = '0%';
    charactersValue.textContent = '0/0';
    progressBar.style.width = '0%';
    timer.textContent = '00:00';
    totalCharacters = 0;
    correctCharacters = 0;

    currentQuote = await fetchRandomQuote();

    quoteDisplay.innerHTML = '';
    currentQuote.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        quoteDisplay.appendChild(charSpan);
    });

    typingInput.disabled = false;
    typingInput.value = '';
    typingInput.focus();

    startButton.textContent = 'Reset Test';
    isTestActive = true;
}

function updateTimer() {
    if (!startTime) return;

    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');

    timer.textContent = `${minutes}:${seconds}`;


    if (elapsedTime > 0) {
        const wordsTyped = typingInput.value.trim().split(/\s+/).length;
        const wpm = Math.round((wordsTyped / elapsedTime) * 60);
        wpmValue.textContent = wpm;
    }
}

function calculateAccuracy() {
    const quoteChars = currentQuote.split('');
    const typedChars = typingInput.value.split('');

    totalCharacters = quoteChars.length;
    correctCharacters = 0;

    typedChars.forEach((char, index) => {
        if (index < quoteChars.length && char === quoteChars[index]) {
            correctCharacters++;
        }
    });

    const accuracy = Math.floor((correctCharacters / totalCharacters) * 100);
    accuracyValue.textContent = `${accuracy}%`;
    charactersValue.textContent = `${correctCharacters}/${totalCharacters}`;

    const progress = Math.min((typedChars.length / quoteChars.length) * 100, 100);
    progressBar.style.width = `${progress}%`;

    const quoteSpans = quoteDisplay.querySelectorAll('span');
    quoteSpans.forEach((charSpan, index) => {
        if (index >= typedChars.length) {
            charSpan.classList.remove('correct', 'incorrect', 'current');
            if (index === typedChars.length) {
                charSpan.classList.add('current');
            }
        } else {
            charSpan.classList.remove('current');
            if (typedChars[index] === quoteChars[index]) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('incorrect');
            } else {
                charSpan.classList.add('incorrect');
                charSpan.classList.remove('correct');
            }
        }
    });

    if (typedChars.length >= quoteChars.length) {
        finishTest();
    }
}


function finishTest() {
    clearInterval(timerInterval);
    typingInput.disabled = true;
    isTestActive = false;
    startButton.textContent = 'Start New Test';

    const finalWPM = parseInt(wpmValue.textContent);
    const finalAccuracy = parseInt(accuracyValue.textContent);
    const finalTime = timer.textContent;
    const finalCharacters = charactersValue.textContent;
    saveScore(finalWPM, finalAccuracy, finalTime, finalCharacters);
}


startButton.addEventListener('click', function() {
    startTest();
});

typingInput.addEventListener('input', function() {
    if (!startTime && typingInput.value.length > 0) {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }

    if (isTestActive) {
        calculateAccuracy();
    }
});
startButton.textContent = 'Start Test';

viewScoresBtn.addEventListener("click", function() {
    const scoreData = localStorage.getItem("previousScore");
    if (scoreData) {
        const score = JSON.parse(scoreData);
        previousScore.innerHTML = `
      <strong>WPM:</strong> ${score.wpm}<br>
      <strong>Accuracy:</strong> ${score.accuracy}%<br>
      <strong>Time:</strong> ${score.time}<br>
      <strong>Characters:</strong> ${score.characters}
    `;
    } else {
        previousScore.innerHTML = "No previous scores yet. Complete a test to record one!";
    }

    viewContainer.style.display = "block";
});