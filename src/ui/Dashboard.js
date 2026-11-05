import { Evaluation } from './Evaluation.js';
import { renderFooter } from './Footer.js';
import { Leaderboard } from './Leaderboard.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export class Dashboard {
  constructor(root) {
    this.root = root;
    this.evaluationView = new Evaluation();
    this.leaderboardView = new Leaderboard();
  }

  home(data) {
    const best = data.bestScore ? `${data.bestScore} poin` : 'Belum ada skor';
    this.root.innerHTML = `<main class="landing">
      <nav class="topbar landing-nav"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="player-chip" data-action="profile"><span>👩🏻‍🚀</span> ${escapeHTML(data.playerName)}</button></nav>
      <div class="hero-layout"><div class="hero-copy"><div class="pill"><span class="pulse-dot"></span> PETUALANGAN FISIKA FASE E</div>
        <h1>Jelajahi dunia<br><span>gerak</span></h1><p class="hero-subtitle">Belajar GLB dan GLBB lewat balapan yang seru. Pahami konsepnya, taklukkan lintasannya!</p>
        <div class="hero-buttons"><button class="btn btn-primary btn-large" data-action="start">🚗 MULAI BERMAIN <span>→</span></button><button class="btn btn-outline btn-large" data-action="guide">▶ Petunjuk</button></div>
        <div class="quick-links"><button data-action="materials">📖 Materi fisika</button><button data-action="settings">⚙ Pengaturan</button><button data-action="history">🕘 Riwayat</button></div>
        <div class="home-progress"><span>Rekor terbaik</span><strong>${best}</strong><span class="progress-dot">✦</span></div>
      </div><div class="hero-art"><img class="hero-image" src="${import.meta.env.BASE_URL}images/hero-physics-adventure.jpg?v=2" alt="Ilustrasi Physics Adventure SULTRA dengan mobil balap dan pegunungan" /></div></div>
      <div class="feature-row"><div><span>🧭</span><strong>3 LEVEL SERU</strong><small>Dari lembah sampai grand prix</small></div><div><span>🧠</span><strong>BELAJAR SAMBIL MAIN</strong><small>10 tantangan di setiap level</small></div><div><span>🏆</span><strong>JADI JUARA FISIKA</strong><small>Kumpulkan skor dan pencapaian</small></div></div>
      ${renderFooter()}</main>`;
  }

  guide() {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="content-card"><p class="eyebrow">SEBELUM MULAI</p><h1>Petunjuk petualangan</h1><p class="lead">Kendalikan mobil, kumpulkan koin, dan jawab pertanyaan di setiap checkpoint. Jawaban benar bernilai 100 poin dan 5 koin bonus.</p>
      <div class="guide-grid"><article><span>⬆️ ⬇️ ⬅️ ➡️</span><h3>Kontrol keyboard</h3><p>Panah atas untuk gas, bawah untuk rem, kiri/kanan untuk berpindah jalur.</p></article><article><span>⏸️</span><h3>Jeda permainan</h3><p>Tekan spasi atau tombol jeda kapan saja.</p></article><article><span>📱</span><h3>Layar sentuh</h3><p>Tekan dan tahan tombol kontrol yang tampil di bawah scene.</p></article><article><span>⚡</span><h3>Belajar fisika</h3><p>Checkpoint muncul setiap 30 m. Selesaikan 10 soal untuk menuntaskan level.</p></article></div>
      <button class="btn btn-primary" data-action="start">Mengerti, mulai bermain →</button></div>${renderFooter()}</section>`;
  }

  levels(data) {
    const levelCards = data.levels.map((level, index) => {
      const done = data.completed.includes(level.id);
      const locked = index > 0 && !data.completed.includes(data.levels[index - 1].id);
      return `<article class="level-card ${locked ? 'locked' : ''}" style="--level-accent:${level.accent}">
        <div class="level-number">LEVEL 0${index + 1} ${done ? '<span>✓ SELESAI</span>' : ''}</div><div class="level-icon">${['🛣️', '⛰️', '🏁'][index]}</div><h2>${escapeHTML(level.name)}</h2><h3>${escapeHTML(level.subtitle)}</h3><p>${escapeHTML(level.description)}</p>
        <button class="btn ${locked ? 'btn-locked' : 'btn-level'}" data-action="select-level" data-level="${level.id}" ${locked ? 'disabled' : ''}>${locked ? '🔒 Selesaikan level sebelumnya' : done ? 'Mainkan lagi →' : 'Pilih level →'}</button>
      </article>`;
    }).join('');
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="content-heading"><p class="eyebrow">PILIH PETUALANGAN</p><h1>Tentukan lintasanmu</h1><p>Setiap lintasan punya tantangan dan konsep gerak yang berbeda.</p></div>
      <div class="level-grid">${levelCards}</div><div class="multiplayer-strip"><span>👥</span><div><strong>Main bersama teman?</strong><small>Gunakan satu perangkat dan bergantian menyelesaikan level.</small></div><button class="btn btn-secondary" data-action="local-mode">Main berdua</button><button class="btn btn-ghost" data-action="leaderboard">Leaderboard</button></div></section>`;
  }

  chooseMode(mode, data) {
    this.pendingMode = mode;
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="levels">← Kembali</button></header>
    <div class="content-card narrow"><p class="eyebrow">SIAP BERANGKAT?</p><h1>${mode === 'local' ? 'Pemain bergantian' : 'Petualangan solo'}</h1><p>${mode === 'local' ? 'Masukkan nama dua pemain. Masing-masing akan mendapat satu giliran pada level yang dipilih.' : 'Siapkan nama petualangmu sebelum memilih level.'}</p>
    <label class="field-label">Nama pemain 1<input id="player-name" maxlength="24" value="${escapeHTML(data.playerName)}" placeholder="Nama petualang"></label>
    ${mode === 'local' ? '<label class="field-label">Nama pemain 2<input id="player-two" maxlength="24" value="Teman" placeholder="Nama teman"></label>' : ''}
    <button class="btn btn-primary" data-action="confirm-mode">Pilih level →</button></div></section>`;
  }

  materials() {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
    <div class="content-heading"><p class="eyebrow">LAB FISIKA INTERAKTIF</p><h1>Rumusnya bergerak!</h1><p>Ubah variabel dan amati bagaimana gerak benda berubah.</p></div>
    <div class="material-grid"><article class="content-card formula-card"><div class="formula-icon">🚙</div><p class="eyebrow">GERAK LURUS BERATURAN</p><h2>GLB</h2><p>Gerak pada lintasan lurus dengan kecepatan tetap. Percepatan benda sama dengan nol.</p><div class="formula-box">s = v × t</div><label class="slider-label">Kecepatan <b><output id="sim-speed-value">10</output> m/s</b><input id="sim-speed" type="range" min="2" max="24" value="10"></label><label class="slider-label">Waktu <b><output id="sim-time-value">5</output> s</b><input id="sim-time" type="range" min="1" max="10" value="5"></label><p class="calculation">Jarak: <strong id="sim-distance">50</strong> m</p></article>
    <article class="content-card formula-card"><div class="formula-icon">🏎️</div><p class="eyebrow">GERAK LURUS BERUBAH BERATURAN</p><h2>GLBB</h2><p>Kecepatan berubah secara teratur karena percepatan konstan.</p><div class="formula-box">v = v₀ + at<br><small>s = v₀t + ½at²</small></div><label class="slider-label">Kecepatan awal <b><output id="sim-v0-value">2</output> m/s</b><input id="sim-v0" type="range" min="0" max="12" value="2"></label><label class="slider-label">Percepatan <b><output id="sim-accel-value">2</output> m/s²</b><input id="sim-accel" type="range" min="1" max="6" value="2"></label><label class="slider-label">Waktu <b><output id="sim-glbb-time-value">4</output> s</b><input id="sim-glbb-time" type="range" min="1" max="8" value="4"></label><p class="calculation">Kecepatan akhir: <strong id="sim-final-speed">10</strong> m/s · Jarak: <strong id="sim-glbb-distance">24</strong> m</p></article></div>
    <article class="content-card graph-card"><h2>Grafik posisi–waktu GLB</h2><p>Gradien grafik posisi terhadap waktu menunjukkan kecepatan.</p><canvas id="material-graph" width="720" height="240" aria-label="Grafik posisi terhadap waktu"></canvas></article>
    <div class="material-grid graph-pair"><article class="content-card graph-card"><h2>Grafik kecepatan–waktu GLBB</h2><p>Gradien menunjukkan percepatan; luas di bawah garis menunjukkan perpindahan.</p><canvas id="velocity-graph" width="720" height="240" aria-label="Grafik kecepatan terhadap waktu"></canvas></article>
    <article class="content-card graph-card"><h2>Grafik percepatan–waktu</h2><p>Percepatan konstan membentuk garis horizontal.</p><canvas id="acceleration-graph" width="720" height="240" aria-label="Grafik percepatan terhadap waktu"></canvas></article></div>
    <button class="btn btn-primary" data-action="levels">Siap bermain →</button>${renderFooter()}</section>`;
  }

  settings(data) {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow">
      <p class="eyebrow">PREFERENSI</p><h1>Pengaturan</h1><label class="setting-row"><span><strong>Efek suara</strong><small>Suara koin dan jawaban kuis</small></span><input type="checkbox" data-setting="sound" ${data.settings.sound ? 'checked' : ''}></label>
      <label class="setting-row"><span><strong>Musik latar</strong><small>Melodi sederhana selama bermain</small></span><input type="checkbox" data-setting="music" ${data.settings.music ? 'checked' : ''}></label>
      <p class="muted-note">Suara dimulai setelah interaksi pertama dan dapat dimatikan kapan saja.</p></div></section>`;
  }

  profile(data) {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow">
      <p class="eyebrow">KARTU PETUALANG</p><div class="profile-avatar">🧑🏻‍🚀</div><h1>${escapeHTML(data.playerName)}</h1><p>Level selesai: <strong>${data.completed.length}/3</strong></p><p>Skor terbaik: <strong>${data.bestScore || 0}</strong></p>
      <div class="achievement-list"><strong>Pencapaian</strong><p>${data.completed.length ? data.completed.map((id) => `🏁 ${escapeHTML(data.levels.find((level) => level.id === id)?.name ?? id)}`).join('<br>') : 'Selesaikan level untuk membuka pencapaian.'}</p></div>
      <button class="btn btn-secondary" data-action="history">Lihat riwayat permainan</button><button class="btn btn-ghost" data-action="leaderboard">Leaderboard lokal</button></div></section>`;
  }

  history(records) {
    const list = [...records].reverse().slice(0, 20);
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card">
      <p class="eyebrow">CATATAN PETUALANGAN</p><h1>Riwayat permainan</h1>${list.length ? `<div class="history-list">${list.map((record) => `<div><span>🏁</span><div><strong>${escapeHTML(record.playerName)}</strong><small>${escapeHTML(record.levelName)} · ${new Date(record.date).toLocaleString('id-ID')} · ${record.accuracy}% akurasi</small></div><b>${record.score} pts</b></div>`).join('')}</div>` : '<div class="empty-state">Belum ada permainan. Petualangan pertamamu menunggu!</div>'}</div></section>`;
  }

  game(level, playerName, turn, mode) {
    this.root.innerHTML = `<main class="game-screen"><div class="game-topbar"><button class="icon-button" data-action="home" aria-label="Keluar">←</button><div class="game-level"><span>🚗</span><div><strong>${escapeHTML(level.name)}</strong><small>${escapeHTML(playerName)}${mode === 'local' ? ` · Pemain ${turn + 1}` : ''}</small></div></div><button class="pause-button" data-action="pause">⏸ Jeda</button></div>
      <div class="game-stage"><canvas id="game-canvas" aria-label="Scene permainan 3D"></canvas><div class="hud">
        <div class="hud-row"><div class="hud-card"><small>KECEPATAN</small><strong id="hud-speed">0 km/j</strong></div><div class="hud-card"><small>PERCEPATAN</small><strong id="hud-acceleration">0 m/s²</strong></div><div class="hud-card"><small>JARAK</small><strong id="hud-distance">0 m</strong></div><div class="hud-card"><small>WAKTU</small><strong id="hud-time">0 dtk</strong></div><div class="hud-card coin-hud"><small>KOIN</small><strong>🪙 <span id="hud-coins">0</span></strong></div></div>
        <div class="progress-track"><div id="hud-progress"></div></div></div>
        <div class="game-tip">⬆ Gas &nbsp; ⬇ Rem &nbsp; ⬅ ➡ Setir &nbsp; <span>Checkpoint tiap 30 m</span></div>
      </div><div class="touch-controls"><button data-control="left">◀</button><button data-control="down">▼</button><button data-control="up">▲</button><button data-control="right">▶</button></div>${renderFooter()}<div id="game-modal"></div></main>`;
  }

  question(question, index, total) {
    const options = question.options.map((option, i) => `<button class="answer-option" data-action="answer" data-option="${i}"><span>${String.fromCharCode(65 + i)}</span>${escapeHTML(option)}</button>`).join('');
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card"><div class="quiz-progress"><span>CHECKPOINT ${index + 1} / ${total}</span><span>🧠 Tantangan fisika</span></div><div class="quiz-progress-track"><i style="width:${(index + 1) / total * 100}%"></i></div><h2>${escapeHTML(question.question)}</h2><div class="answer-grid">${options}</div></section></div>`;
  }

  answerFeedback(result, onContinueLabel = 'Lanjutkan perjalanan →') {
    const correct = result.correct;
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card feedback-card ${correct ? 'is-correct' : 'is-wrong'}"><div class="feedback-icon">${correct ? '🎉' : '💡'}</div><p class="eyebrow">${correct ? 'JAWABAN BENAR · +100 POIN · +5 KOIN' : 'BELUM TEPAT'}</p><h2>${correct ? 'Hebat, petualang!' : 'Yuk pahami konsepnya!'}</h2><div class="formula-box">${escapeHTML(result.formula)}</div><p>${escapeHTML(result.explanation)}</p>${correct ? '' : `<p class="correct-answer">Jawaban benar: <strong>${escapeHTML(result.correctAnswer)}</strong></p>`}<button class="btn btn-primary" data-action="continue">${onContinueLabel}</button></section></div>`;
  }

  clearModal() {
    const modal = this.root.querySelector('#game-modal');
    if (modal) modal.innerHTML = '';
  }

  pause() {
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card pause-card"><div class="feedback-icon">⏸️</div><p class="eyebrow">WAKTU ISTIRAHAT</p><h2>Permainan dijeda</h2><p>Tarik napas, lalu lanjutkan petualanganmu.</p><button class="btn btn-primary" data-action="resume">▶ Lanjutkan</button><button class="btn btn-ghost" data-action="quit">Keluar ke beranda</button></section></div>`;
  }

  evaluation(result) {
    this.root.innerHTML = this.evaluationView.render(result);
  }

  leaderboard(entries) {
    this.root.innerHTML = this.leaderboardView.render(entries);
  }

  notice(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.root.append(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }
}
