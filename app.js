// temp for test
//localStorage.removeItem("START_TIME");
//localStorage.removeItem("currentIndex");
//localStorage.removeItem("messageRevealed");

import MESSAGES from "./messages.js";

const heart = document.getElementById("heart");
const note = document.getElementById("note");
const timerEl = document.getElementById("timer");
const volEl = document.getElementById("vol");
const specialNoteEl = document.getElementById("specialNote");

timerEl.style.display = "block";

/* =========================
   TIME CONFIG
========================= */

// EST helper
const EST_OFFSET = -5; // hours
function getNowEST() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * EST_OFFSET);
}

// START TIME with persistence
let START_TIME;
if (localStorage.getItem("START_TIME")) {
  START_TIME = new Date(parseInt(localStorage.getItem("START_TIME")));
} else {
  // REAL SITE START TIME (Feb 14 2026 midnight EST)
  START_TIME = new Date("2026-02-05T00:00:00-05:00");
  // TEST MODE: 10 seconds from now
  // START_TIME = new Date(Date.now() + 10000);
  // TEST MODE: actual start time, no reset
  // START_TIME = new Date("2026-02-05T01:35:00-05:00");
  localStorage.setItem("START_TIME", START_TIME.getTime());
}

// Unlock spacing
//onst MINUTES_BETWEEN = 1; // test mode
const MINUTES_BETWEEN = 1440; // 1440 for 24 hours
const unlockDates = MESSAGES.map((_, i) =>
  new Date(START_TIME.getTime() + i * MINUTES_BETWEEN * 60000)
);

// Persist the last revealed message index
let currentIndex = parseInt(localStorage.getItem("currentIndex")) || -1;
let messageRevealed = localStorage.getItem("messageRevealed") === "true";

/* =========================
   SPECIAL DATES
========================= */

const SPECIAL_DATES = {
  "2-14": "Happy Valentine's Day!",
  "5-4": "Happy Birthday, beautiful! Finally the big 21!",
  "7-4": "Happy 4th of July!",
  "10-31": "Happy Halloween!",
  "11-26": "Happy Thanksgiving!",
  "12-22": "Happy 3 year anniversary! Best 3 years ever!",
  "12-25": "Merry Christmas!",
  "2-6": "testing the feb6 special note work"
};

function updateSpecialMessage() {
  const now = getNowEST();
  const key = `${now.getMonth() + 1}-${now.getDate()}`;

  if (SPECIAL_DATES[key]) {
    specialNoteEl.textContent = SPECIAL_DATES[key];
    specialNoteEl.classList.remove("hidden");
  }
}

/* =========================
   CORE LOGIC
========================= */

function getUnlockedIndex() {
  const now = getNowEST();
  for (let i = unlockDates.length - 1; i >= 0; i--) {
    if (now >= unlockDates[i]) return i;
  }
  return -1;
}

function typeMessage(msg, element, callback) {
  element.textContent = "";
  element.classList.remove("hidden");
  let i = 0;

  const interval = setInterval(() => {
    element.textContent += msg[i];
    i++;
    if (i >= msg.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 50);
}

function updateTimer() {
  const unlockedIndex = getUnlockedIndex();

  if (unlockedIndex > currentIndex) {
    note.classList.add("hidden");
    messageRevealed = false;
    currentIndex = unlockedIndex;

    localStorage.setItem("currentIndex", currentIndex);
    localStorage.setItem("messageRevealed", "false");

    if (currentIndex < MESSAGES.length && currentIndex >= 0) {
      timerEl.innerText = "💌 You have a new message";
      heart.style.pointerEvents = "auto";

      if (volEl) {
        volEl.innerText = `Vol. ${currentIndex + 1}/${MESSAGES.length}`;
      }
    }
  }

  if (messageRevealed && currentIndex + 1 < unlockDates.length) {
    const diff = unlockDates[currentIndex + 1] - getNowEST();

    if (diff > 0) {
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      timerEl.innerText =
        `Come back in ${hours}h ${minutes}m ${seconds}s for the next note`;
    }
  }
}

/* =========================
   EVENTS
========================= */

heart.addEventListener("click", () => {
  if (currentIndex >= 0 && !messageRevealed) {
    typeMessage(MESSAGES[currentIndex], note, () => {
      messageRevealed = true;
      localStorage.setItem("messageRevealed", "true");
      localStorage.setItem("currentIndex", currentIndex);
    });
  }
});

/* =========================
   FLOATING HEARTS
========================= */

const heartsContainer = document.createElement("div");
heartsContainer.className = "floating-hearts";
document.body.appendChild(heartsContainer);

function createFloatingHeart() {
  const heart = document.createElement("div");
  heart.className = "floating-heart";
  heart.innerText = "❤️";

  const size = Math.random() * 30 + 25;
  heart.style.fontSize = `${size}px`;
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${Math.random() * 10 + 10}s`;

  heartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 20000);
}

setInterval(createFloatingHeart, 1500);

/* =========================
   START
========================= */

updateSpecialMessage();
updateTimer();
setInterval(updateTimer, 1000);

// Show previously revealed message after refresh
if (messageRevealed && currentIndex >= 0) {
  note.classList.remove("hidden");
  note.textContent = MESSAGES[currentIndex];
}
