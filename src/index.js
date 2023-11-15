const POMODORO = "pomodoro";
const SHORT_BREAK = "short-break";
const LONG_BREAK = "long-break";
const KUMBH_SANS = "kumbh-sans";
const ROBOTO_SERIF = "roboto-slab";
const SPACE_MONO = "space-mono";
const RED = "red";
const CYAN = "cyan";
const VIOLET = "violet";

const DEFAULT_DURATIONS = {
  [POMODORO]: 25,
  [SHORT_BREAK]: 5,
  [LONG_BREAK]: 15,
};

const INITIAL_SETTINGS = {
  open: false,
  font: KUMBH_SANS,
  color: RED,
  durations: { ...DEFAULT_DURATIONS },
  _raw: { durations: { ...DEFAULT_DURATIONS }, color: RED, font: KUMBH_SANS },
  _errors: {
    [POMODORO]: false,
    [SHORT_BREAK]: false,
    [LONG_BREAK]: false,
  },
};

const timestampInSeconds = () => Math.floor(Date.now() / 1000);

const minutesToSeconds = (minutes) => minutes * 60;
const secondsToMinutes = (duration) => {
  let seconds = parseInt(duration % 60, 10);
  let minutes = parseInt((duration / 60) % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return minutes + ":" + seconds;
};

const durationToPercents = (currentDuration, fullDuration) => {
  const fullDurationSeconds = minutesToSeconds(fullDuration);
  const singlePercent = fullDurationSeconds / 100;
  const durationDifference = fullDurationSeconds - currentDuration;
  return 100 - durationDifference / singlePercent;
};

const app = () => ({
  actions: [POMODORO, SHORT_BREAK, LONG_BREAK],
  colors: [RED, CYAN, VIOLET],
  fonts: [KUMBH_SANS, ROBOTO_SERIF, SPACE_MONO],

  activeAction: POMODORO,
  runningTimer: null,
  timerDuration: null,
  settings: INITIAL_SETTINGS,

  init() {
    ["activeAction", "timerDuration", "settings"].forEach((key) => {
      idbKeyval.get(key).then((value) => {
        if (value) {
          this[key] = value;
        }
      });
    });
    idbKeyval.get("timerDuration").then((timerDuration) => {
      if (timerDuration) {
        this.timerDuration = timerDuration;
      } else {
        this.timerDuration = minutesToSeconds(this.settings.durations[this.activeAction]);
      }
    });
    window.dispatchEvent(new Event("resize"));
  },

  start() {
    this.runningTimer = setInterval(() => {
      if (this.timerDuration <= 0) {
        this.resetTimers();
        return;
      }
      this.timerDuration -= 1;
      idbKeyval.set("timerDuration", this.timerDuration);
    }, 1000);
  },
  pause() {
    clearInterval(this.runningTimer);
    this.runningTimer = null;
  },
  resetTimers() {
    this.pause();
    idbKeyval.del("timerDuration");
    this.timerDuration = minutesToSeconds(this.settings.durations[this.activeAction]);
  },
  setAction(action) {
    this.activeAction = action;
    idbKeyval.set("activeAction", action);
    this.resetTimers();
  },
  validate(value, action) {
    if (value > 59 || value < 1 || value % 1 !== 0) {
      this.settings._errors[action] = true;
    } else {
      this.settings._errors[action] = false;
      this.settings._raw.durations[action] = value;
    }
  },
  applySettings() {
    const newSettings = JSON.parse(JSON.stringify({ ...this.settings, ...this.settings._raw }));
    this.settings = newSettings;
    idbKeyval.set("settings", newSettings);
  },
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}
