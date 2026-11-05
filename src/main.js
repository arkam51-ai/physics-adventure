import './style.css';
import { Dashboard } from './ui/Dashboard.js';
import { GameHUD } from './ui/GameHUD.js';
import { Game } from './game/Game.js';
import { LevelManager } from './game/LevelManager.js';
import { QuestionBank } from './quiz/QuestionBank.js';
import { QuizManager } from './quiz/QuizManager.js';

const STORAGE_KEY = 'physics-adventure-3d-save';
const defaultSave = () => ({
  playerName: 'Petualang',
  completed: [],
  records: [],
  leaderboard: [],
  settings: { sound: true, music: false }
});

function loadSave() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSave();
    const parsed = JSON.parse(stored);
    return { ...defaultSave(), ...parsed, settings: { ...defaultSave().settings, ...parsed.settings } };
  } catch (error) {
    console.warn('Progres lokal tidak dapat dibaca; progres baru akan digunakan.', error);
    return defaultSave();
  }
}

const root = document.querySelector('#app');
const dashboard = new Dashboard(root);
const levels = new LevelManager();
const quiz = new QuizManager(new QuestionBank());
const save = loadSave();
let game = null;
let hud = null;
let selectedMode = 'single';
let selectedLevel = levels.getLevels()[0];
let playerNames = [save.playerName, 'Teman'];
let currentTurn = 0;
let currentScore = 0;
let correctCoins = 0;
let checkpointQuizOpen = false;
let lastGameState = { distance: 0, speed: 0, acceleration: 0, elapsed: 0, coins: 0 };
let returnPage = () => showHome();

class SoundEffects {
  constructor() {
    this.context = null;
    this.musicTimer = null;
    this.note = 0;
  }

  tone(frequency, duration = 0.12, type = 'sine', volume = 0.08) {
    if (!save.settings.sound) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') this.context.resume();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    } catch (error) {
      console.warn('Audio tidak tersedia di browser ini.', error);
    }
  }

  coin() {
    this.tone(880, 0.1);
    window.setTimeout(() => this.tone(1175, 0.14), 75);
  }

  answer(correct) {
    this.tone(correct ? 660 : 240, 0.22, correct ? 'triangle' : 'sine');
  }

  setMusic(enabled) {
    if (this.musicTimer) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    if (!enabled) return;
    const notes = [392, 494, 587, 494, 440, 523, 659, 523];
    this.musicTimer = window.setInterval(() => {
      if (save.settings.music && save.settings.sound) this.tone(notes[this.note++ % notes.length], 0.32, 'sine', 0.018);
    }, 420);
    this.tone(392, 0.32, 'sine', 0.018);
  }
}

const sound = new SoundEffects();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (error) {
    console.warn('Progres tidak dapat disimpan di perangkat ini.', error);
    dashboard.notice('Penyimpanan lokal tidak tersedia.');
  }
}

function showHome() {
  destroyGame();
  returnPage = showHome;
  dashboard.home({
    playerName: save.playerName,
    bestScore: Math.max(0, ...save.records.map((record) => record.score))
  });
}

function showLevels() {
  destroyGame();
  returnPage = showLevels;
  dashboard.levels({
    levels: levels.getLevels(),
    completed: save.completed
  });
}

function destroyGame() {
  if (!game) return;
  game.destroy();
  game = null;
  hud = null;
  sound.setMusic(false);
}

function startMode(mode) {
  selectedMode = mode;
  dashboard.chooseMode(mode, { playerName: save.playerName });
}

function confirmMode() {
  const first = root.querySelector('#player-name')?.value.trim();
  const second = root.querySelector('#player-two')?.value.trim();
  if (!first) {
    dashboard.notice('Nama pemain perlu diisi.');
    return;
  }
  playerNames = [first, second || 'Teman'];
  save.playerName = first;
  persist();
  showLevels();
}

function startLevel(levelId, turn = 0) {
  selectedLevel = levels.getLevel(levelId);
  currentTurn = turn;
  currentScore = 0;
  correctCoins = 0;
  checkpointQuizOpen = false;
  lastGameState = { distance: 0, speed: 0, acceleration: 0, elapsed: 0, coins: 0 };
  quiz.start(selectedLevel.id);
  destroyGame();
  dashboard.game(selectedLevel, playerNames[currentTurn], currentTurn, selectedMode);
  const canvas = root.querySelector('#game-canvas');
  hud = new GameHUD(root);
  game = new Game(canvas, {
    onUpdate: (state) => {
      lastGameState = state;
      hud.update(state);
    },
    onCoin: (coins) => {
      sound.coin();
      dashboard.notice(`Koin terkumpul: ${coins} 🪙`);
    },
    onObstacle: () => dashboard.notice('Rintangan! Atur jalur dan kecepatan.'),
    onCheckpoint: (index) => {
      checkpointQuizOpen = true;
      dashboard.question(quiz.getCurrent(), index, quiz.total);
    },
    onPauseRequest: togglePause,
    onFinish: finishLevel
  });
  if (save.settings.music) sound.setMusic(true);
  game.start(selectedLevel);
}

function togglePause() {
  if (!game || !game.running) return;
  if (checkpointQuizOpen) return;
  game.setPaused(true);
  dashboard.pause();
}

function answerQuestion(option) {
  const result = quiz.answer(option);
  sound.answer(result.correct);
  if (result.correct) {
    currentScore += 100;
    correctCoins += 5;
  }
  dashboard.answerFeedback(result);
}

function resumeAfterAnswer() {
  checkpointQuizOpen = false;
  dashboard.clearModal();
  game?.setPaused(false);
}

function finishLevel() {
  sound.setMusic(false);
  const accuracy = Math.round(quiz.correct / quiz.total * 100);
  const result = {
    playerName: playerNames[currentTurn],
    level: selectedLevel,
    mode: selectedMode,
    score: currentScore + lastGameState.coins * 10,
    correct: quiz.correct,
    wrong: quiz.wrong,
    accuracy,
    average: Math.round(currentScore / quiz.total),
    elapsed: lastGameState.elapsed,
    coins: lastGameState.coins + correctCoins,
    missedTopics: quiz.missedTopics,
    nextPlayer: selectedMode === 'local' && currentTurn === 0
  };
  save.completed = [...new Set([...save.completed, selectedLevel.id])];
  save.records.push({
    playerName: result.playerName,
    levelId: selectedLevel.id,
    levelName: selectedLevel.name,
    score: result.score,
    accuracy: result.accuracy,
    date: new Date().toISOString()
  });
  save.leaderboard.push({
    name: result.playerName,
    level: selectedLevel.name,
    score: result.score,
    date: new Date().toISOString()
  });
  persist();
  dashboard.evaluation(result);
  const completedGame = game;
  window.setTimeout(() => {
    if (game === completedGame) destroyGame();
  }, 0);
}

function updateSimulation() {
  const speed = Number(root.querySelector('#sim-speed')?.value ?? 10);
  const time = Number(root.querySelector('#sim-time')?.value ?? 5);
  const v0 = Number(root.querySelector('#sim-v0')?.value ?? 2);
  const acceleration = Number(root.querySelector('#sim-accel')?.value ?? 2);
  const glbbTime = Number(root.querySelector('#sim-glbb-time')?.value ?? 4);
  const setText = (selector, value) => {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  };
  setText('#sim-speed-value', speed);
  setText('#sim-time-value', time);
  setText('#sim-distance', speed * time);
  setText('#sim-v0-value', v0);
  setText('#sim-accel-value', acceleration);
  setText('#sim-glbb-time-value', glbbTime);
  setText('#sim-final-speed', (v0 + acceleration * glbbTime).toFixed(1));
  setText('#sim-glbb-distance', (v0 * glbbTime + 0.5 * acceleration * glbbTime ** 2).toFixed(1));
  const drawGraph = (canvasId, label, startValue, endValue, maxValue, color) => {
    const canvas = root.querySelector(`#${canvasId}`);
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const left = 62;
    const right = width - 22;
    const top = 18;
    const bottom = height - 35;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f5faff';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = '#dce8f3';
    context.lineWidth = 1;
    for (let x = left + 65; x < right; x += 65) {
      context.beginPath(); context.moveTo(x, top); context.lineTo(x, bottom); context.stroke();
    }
    for (let y = top + 38; y < bottom; y += 38) {
      context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
    }
    context.strokeStyle = '#8497ab';
    context.beginPath(); context.moveTo(left, top); context.lineTo(left, bottom); context.lineTo(right, bottom); context.stroke();
    context.fillStyle = '#60738a';
    context.font = '14px system-ui';
    context.fillText(label, 10, 22);
    context.fillText('t (s)', width - 49, height - 10);
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(left, bottom - Math.min(1, startValue / maxValue) * (bottom - top));
    context.lineTo(right, bottom - Math.min(1, endValue / maxValue) * (bottom - top));
    context.stroke();
  };
  drawGraph('material-graph', 's (m)', 0, speed * time, 250, '#337fe0');
  drawGraph('velocity-graph', 'v (m/s)', v0, v0 + acceleration * glbbTime, 60, '#31a77d');
  drawGraph('acceleration-graph', 'a (m/s²)', acceleration, acceleration, 8, '#eb9450');
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const { action } = button.dataset;
  if (action !== 'answer') sound.tone(520, 0.05, 'sine', 0.025);
  switch (action) {
    case 'home': showHome(); break;
    case 'start': startMode('single'); break;
    case 'guide': returnPage = showHome; dashboard.guide(); break;
    case 'levels': showLevels(); break;
    case 'select-level':
      if (selectedMode === 'local' && save.completed.length === 0 && button.dataset.level !== levels.getLevels()[0].id) {
        dashboard.notice('Selesaikan Level 1 untuk membuka lintasan berikutnya.');
      } else startLevel(button.dataset.level);
      break;
    case 'local-mode': startMode('local'); break;
    case 'confirm-mode': confirmMode(); break;
    case 'materials': returnPage = showHome; dashboard.materials(); updateSimulation(); break;
    case 'settings': returnPage = showHome; dashboard.settings(save); break;
    case 'profile': returnPage = showHome; dashboard.profile({ ...save, levels: levels.getLevels() }); break;
    case 'history': returnPage = showHome; dashboard.history(save.records); break;
    case 'leaderboard': returnPage = showHome; dashboard.leaderboard(save.leaderboard); break;
    case 'back': returnPage(); break;
    case 'pause': togglePause(); break;
    case 'resume': dashboard.clearModal(); game?.setPaused(false); break;
    case 'quit': showHome(); break;
    case 'answer': answerQuestion(Number(button.dataset.option)); break;
    case 'continue': resumeAfterAnswer(); break;
    case 'next-player': startLevel(selectedLevel.id, 1); break;
  }
});

root.addEventListener('change', (event) => {
  const setting = event.target.dataset.setting;
  if (!setting) return;
  save.settings[setting] = event.target.checked;
  persist();
  if (setting === 'music') {
    if (save.settings.music) sound.setMusic(true);
    else sound.setMusic(false);
  }
  if (setting === 'sound' && !save.settings.sound) sound.setMusic(false);
});

root.addEventListener('input', (event) => {
  if (event.target.matches('#sim-speed, #sim-time, #sim-v0, #sim-accel, #sim-glbb-time')) updateSimulation();
});

const activeControls = new Map();
root.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('[data-control]');
  if (!button || !game) return;
  event.preventDefault();
  button.setPointerCapture(event.pointerId);
  activeControls.set(event.pointerId, button.dataset.control);
  game.setControl(button.dataset.control, true);
});
const releaseControl = (event) => {
  const control = activeControls.get(event.pointerId);
  if (control) game?.setControl(control, false);
  activeControls.delete(event.pointerId);
};
root.addEventListener('pointerup', releaseControl);
root.addEventListener('pointercancel', releaseControl);
root.addEventListener('lostpointercapture', releaseControl);

function showHomeAtStartup() {
  showHome();
  updateSimulation();
}

showHomeAtStartup();
