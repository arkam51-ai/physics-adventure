import { Evaluation } from './Evaluation.js';
import { renderFooter } from './Footer.js';
import { HeroParticles } from './HeroParticles.js';
import { Leaderboard } from './Leaderboard.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const NEUTRAL_CHARACTER_THUMBNAIL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100"%3E%3Crect width="80" height="100" rx="18" fill="%23dce5ec"/%3E%3Ccircle cx="40" cy="32" r="16" fill="%238b9aa7"/%3E%3Cpath d="M12 91c2-21 12-32 28-32s26 11 28 32" fill="%238b9aa7"/%3E%3C/svg%3E';

export class Dashboard {
  constructor(root) {
    this.root = root;
    this.evaluationView = new Evaluation();
    this.leaderboardView = new Leaderboard();
    this.gameplayToast = null;
    this.gameplayToastTimer = null;
    this.gameplayToastReposition = null;
    this.levelCarPreviewPreloadScheduled = false;
    this.characterThumbnailsReady = Promise.resolve();
  }

  home(data) {
    const best = data.bestScore ? `${data.bestScore} poin` : 'Belum ada skor';
    const selectedCharacterId = data.selectedCharacterId || '';
    this.root.innerHTML = `<main class="landing">
      <nav class="topbar landing-nav"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><span class="player-chip"><img class="character-thumbnail character-thumbnail-chip" data-character-thumbnail="${escapeHTML(selectedCharacterId)}" src="${NEUTRAL_CHARACTER_THUMBNAIL}" alt=""><span>${escapeHTML(data.playerName)}</span></span></nav>
      <div class="hero-layout"><div class="hero-copy"><div class="pill"><span class="pulse-dot"></span> PETUALANGAN FISIKA</div>
        <h1>Jelajahi Dunia<br><span>Gerak</span></h1><p class="hero-subtitle">Nikmati perjalanan sambil belajar GLB dan GLBB</p>
        
        <div class="quick-links"><button data-action="materials">📖 Materi fisika</button><button data-action="settings">⚙ Pengaturan</button><button data-action="history">🕘 Riwayat</button></div>
        <div class="home-progress"><span>Rekor terbaik</span><strong>${best}</strong><span class="progress-dot">✦</span></div>
      </div><div class="landing-character-panel"><div class="character-choice-group" role="group" aria-label="Pilih karakter pemain">${this.characterChoicesMarkup(selectedCharacterId)}</div>
        <div class="hero-buttons"><button class="btn btn-primary btn-large home-enter-button" data-action="start">MASUK</button><button class="btn btn-outline btn-large" data-action="guide">▶ Petunjuk</button></div>
      </div><div class="hero-art">
  <picture class="hero-picture">
    <source
      media="(max-width: 640px)"
      srcset="${import.meta.env.BASE_URL}images/hero-physics-adventure-mobile.png"
    >
    <img
      class="hero-image"
      src="${import.meta.env.BASE_URL}images/hero-physics-adventure.jpg?v=2"
      alt="Ilustrasi Physics Adventure SULTRA dengan mobil balap dan pegunungan"
    />
  </picture>
</div></div>
      <div class="feature-row"><div><span>🧭</span><strong>LASUSUA → KENDARI</strong><small>Pesisir, perbukitan, sungai, teluk</small></div><div><span>🧠</span><strong>BELAJAR SAMBIL MAIN</strong><small>GLB, GLBB, dan kondisi jalan</small></div><div><span>🏆</span><strong>JADI JUARA FISIKA</strong><small>Kumpulkan skor dan pencapaian</small></div></div>
      ${renderFooter()}</main>`;
    this.heroParticles?.destroy();
    this.heroParticles = new HeroParticles(this.root.querySelector('.hero-art'));
    this.hydrateCharacterThumbnails(this.root);
  }

  nameInput(data) {
    this.root.querySelector('#home-modal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'home-modal';
    modal.innerHTML = `<div class="name-input-overlay"><section class="name-input-card" role="dialog" aria-modal="true" aria-labelledby="name-input-title">
      <p class="eyebrow">SIAP BERANGKAT?</p><h1 id="name-input-title">Masukkan nama petualang</h1>
      <label class="field-label">Nama petualang<input id="player-name" maxlength="24" value="${data.isNewPlayer ? '' : escapeHTML(data.playerName)}"></label>
      <button class="btn btn-primary" data-action="confirm-mode">Lanjutkan &rarr;</button>
    </section></div>`;
    this.root.append(modal);
  }

  characterChoicesMarkup(selectedCharacterId, playerIndex = null) {
    const playerAttribute = playerIndex === null ? '' : `data-player-index="${playerIndex}"`;
    return [
      ['student-male', 'Siswa laki-laki'],
      ['student-female', 'Siswa perempuan']
    ].map(([id, label]) => `<button class="character-choice ${selectedCharacterId === id ? 'is-selected' : ''}" type="button" data-action="choose-character" data-character-id="${id}" ${playerAttribute} aria-pressed="${selectedCharacterId === id}"><img class="character-thumbnail" data-character-thumbnail="${id}" src="${NEUTRAL_CHARACTER_THUMBNAIL}" alt=""><span>${label}</span></button>`).join('');
  }

  localCharacterChoice(playerIndex, selectedCharacterId = null) {
    const playerNumber = playerIndex + 1;
    this.root.innerHTML = `<section class="page-shell local-character-setup"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow"><p class="eyebrow">PEMAIN ${playerNumber} · LANGKAH 1 DARI 2</p><h1>Pilih karakter pemain ${playerNumber}</h1><div class="character-choice-group" role="group" aria-label="Pilih karakter pemain ${playerNumber}">${this.characterChoicesMarkup(selectedCharacterId, playerIndex)}</div><button class="btn btn-primary dashboard-continue-button" data-action="local-next">Lanjutkan</button></div></section>`;
    this.hydrateCharacterThumbnails(this.root);
  }

  localPlayerName(playerIndex, playerName) {
    const playerNumber = playerIndex + 1;
    const inputId = playerIndex === 0 ? 'player-name' : 'player-two';
    const label = playerIndex === 0 ? 'Nama pemain 1' : 'Nama pemain 2';
    const placeholder = playerIndex === 0 ? 'Nama petualang' : 'Nama teman';
    this.root.innerHTML = `<section class="page-shell local-player-name-step"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow"><p class="eyebrow">PEMAIN ${playerNumber} · LANGKAH 2 DARI 2</p><h1>Masukkan nama pemain ${playerNumber}</h1><label class="field-label">${label}<input id="${inputId}" maxlength="24" value="${escapeHTML(playerName)}" placeholder="${placeholder}"></label><button class="btn btn-primary dashboard-continue-button" data-action="local-next">${playerIndex === 0 ? 'Lanjutkan ke pemain 2' : 'Pilih level'} →</button></div></section>`;
  }

  setCharacterSelection(characterId, playerIndex = null) {
    const choices = [...this.root.querySelectorAll('.character-choice')].filter((button) => (
      playerIndex === null
        ? !button.hasAttribute('data-player-index')
        : Number(button.dataset.playerIndex) === playerIndex
    ));
    for (const button of choices) {
      const selected = button.dataset.characterId === characterId;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    if (playerIndex === null) {
      const chipImage = this.root.querySelector('.player-chip [data-character-thumbnail]');
      if (chipImage) chipImage.dataset.characterThumbnail = characterId;
    }
    this.hydrateCharacterThumbnails(this.root);
  }

  hydrateCharacterThumbnails(container) {
    const images = [...container.querySelectorAll('[data-character-thumbnail]')];
    if (!images.length) return this.characterThumbnailsReady;
    this.characterThumbnailsReady = import('./CharacterPreview.js').then(({ prepareCharacterThumbnails, getCharacterThumbnail }) => (
      prepareCharacterThumbnails().then(() => {
        for (const image of images) {
          if (image.isConnected) image.src = getCharacterThumbnail(image.dataset.characterThumbnail);
        }
      })
    )).catch(() => {});
    return this.characterThumbnailsReady;
  }

  guide() {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="content-card"><p class="eyebrow">SEBELUM MULAI</p><h1>Petunjuk petualangan</h1><p class="lead">Kendalikan mobil, kumpulkan koin, dan jawab pertanyaan di setiap checkpoint. Jawaban benar bernilai 150 poin dan 5 koin bonus.</p>
      <div class="guide-grid"><article><span>⬆️ ⬇️ ⬅️ ➡️</span><h3>Keyboard & mouse</h3><p>Gunakan WASD atau panah. Tahan klik kiri dan geser mouse untuk menyetir.</p></article><article><span>⏸️</span><h3>Jeda permainan</h3><p>Tekan spasi atau tombol jeda kapan saja.</p></article><article><span>📱</span><h3>Layar sentuh</h3><p>Gunakan D-pad dan tombol gas/rem di bawah scene.</p></article><article><span>⚛️</span><h3>Belajar fisika</h3><p>Setiap level memiliki satu checkpoint berisi 3 soal. Jawab minimal 2 dengan benar untuk lolos.</p></article></div>
      <button class="btn btn-primary" data-action="start">Mengerti, mulai bermain →</button></div>${renderFooter()}</section>`;
  }

  dashboard(data) {
    this.root.innerHTML = `<section class="dashboard-screen"><header class="dashboard-header">
      <div class="dashboard-heading"><p class="eyebrow dashboard-brand"><span aria-hidden="true">⚛️</span> PHYSICS ADVENTURE SULTRA</p><h1>JELAJAHI DUNIA GERAK</h1><p>Belajar GLB dan GLBB melalui petualangan.</p><div class="dashboard-player-identity"><img class="character-thumbnail" data-character-thumbnail="${escapeHTML(data.playerCharacterId || '')}" src="${NEUTRAL_CHARACTER_THUMBNAIL}" alt=""><span>${escapeHTML(data.playerName)}</span></div></div>
      <div class="dashboard-audio-controls" aria-label="Kontrol audio">
        <div class="dashboard-audio-item dashboard-music-control">
          <button class="dashboard-audio-toggle ${data.settings.music ? 'is-on' : ''}" data-action="toggle-audio" data-setting="music" aria-pressed="${Boolean(data.settings.music)}" aria-label="Musik latar ${data.settings.music ? 'aktif' : 'nonaktif'}">
            <svg class="dashboard-audio-icon dashboard-speaker-icon" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-speaker-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7be4ff"/><stop offset=".5" stop-color="#318df1"/><stop offset="1" stop-color="#2450bd"/></linearGradient></defs><path class="audio-icon-depth" d="M5 18h8l12-10v32L13 30H5z"/><path class="audio-icon-face" d="M5 16h8L25 6v32L13 28H5z"/><path class="audio-icon-highlight" d="M8 18h5L23 10"/><path class="audio-icon-wave" d="M31 17c3 4 3 10 0 14m5-19c6 7 6 17 0 24"/></svg>
            <span class="dashboard-audio-label">Musik Latar</span><strong class="dashboard-audio-state">${data.settings.music ? 'ON' : 'OFF'}</strong>
          </button>
          <label class="dashboard-volume-control"><span>VOLUME MUSIK</span><input type="range" data-setting="musicVolume" min="0" max="100" step="1" value="${data.settings.musicVolume}" aria-label="Volume musik latar"><output>${data.settings.musicVolume}%</output></label>
        </div>
        <div class="dashboard-audio-item">
          <button class="dashboard-audio-toggle ${data.settings.sound ? 'is-on' : ''}" data-action="toggle-audio" data-setting="sound" aria-pressed="${Boolean(data.settings.sound)}" aria-label="Efek suara ${data.settings.sound ? 'aktif' : 'nonaktif'}">
            <svg class="dashboard-audio-icon dashboard-wave-icon" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-wave-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#80e6ff"/><stop offset=".52" stop-color="#5278f2"/><stop offset="1" stop-color="#8b55db"/></linearGradient></defs><path class="audio-icon-wave-face" d="M8 25h5l4-11 7 22 6-29 6 29 4-11h4"/><path class="audio-icon-wave-highlight" d="M8 22h4l4-8m9 10 3-17m6 17 2 8"/></svg>
            <span class="dashboard-audio-label">Efek Suara</span><strong class="dashboard-audio-state">${data.settings.sound ? 'ON' : 'OFF'}</strong>
          </button>
        </div>
      </div>
    </header>
    <div class="dashboard-control-row">
      <nav class="dashboard-menu" aria-label="Menu dashboard">
        <button class="dashboard-menu-button" data-action="guide"><svg class="dashboard-menu-icon-info" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-menu-info-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#72d9ff"/><stop offset="1" stop-color="#3768d5"/></linearGradient></defs><path d="M9 10h19a7 7 0 0 1 7 7v20H16a7 7 0 0 0-7 3z"/><path d="M39 10H20a7 7 0 0 0-7 7v20h19a7 7 0 0 1 7 3z"/><path class="dashboard-menu-icon-highlight" d="M12 13h14m-14 4h7"/></svg><span>PETUNJUK</span></button>
        <button class="dashboard-menu-button" data-action="game-info"><svg class="dashboard-menu-icon-game-info" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-menu-game-info-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#72d9ff"/><stop offset="1" stop-color="#3768d5"/></linearGradient></defs><circle cx="24" cy="24" r="17"/><path d="M24 21v12" stroke="#FFD700"/><circle cx="24" cy="15" r="2.5" fill="#FFD700" stroke="none"/><path class="dashboard-menu-icon-highlight" d="M12 15a15 15 0 0 1 20-5"/></svg><span>INFORMASI GIM</span></button>
        <button class="dashboard-menu-button" data-action="materials"><svg class="dashboard-menu-icon-materials" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-menu-materials-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#72d9ff"/><stop offset="1" stop-color="#3768d5"/></linearGradient></defs><path d="M7 35V11h13a8 8 0 0 1 8 8v19a8 8 0 0 0-8-8H7zm34 0V11H28"/><path d="M14 17h7m-7 6h7m13-6h4m-4 6h4"/><path class="dashboard-menu-icon-highlight" d="M11 14h9m12 0h7"/></svg><span>MATERI</span></button>
        <button class="dashboard-menu-button" data-action="history"><svg class="dashboard-menu-icon-history" viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="dashboard-menu-history-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#72d9ff"/><stop offset="1" stop-color="#3768d5"/></linearGradient></defs><circle cx="24" cy="25" r="16"/><path d="M24 15v11l8 5M8 12v9h9"/><path class="dashboard-menu-icon-highlight" d="M14 21a11 11 0 0 1 17-9"/></svg><span>RIWAYAT</span></button>
            </nav>
    </div>
    <div class="dashboard-route"><span>RUTE PETUALANGAN</span><strong>KOLAKA UTARA <b>&rarr;</b> KENDARI</strong><small>Jelajahi Sulawesi Tenggara sambil menaklukkan konsep gerak.</small></div>
    <div class="dashboard-info-grid">
      <article><span>&#9733;</span><div><strong>BELAJAR SAMBIL PETUALANG</strong><p>Pahami GLB dan GLBB melalui perjalanan, rintangan, dan checkpoint kuis.</p></div></article>
      <article><span>&#10022;</span><div><strong>JADI JUARA FISIKA</strong><p>Kumpulkan poin, selesaikan lintasan, dan tingkatkan rekor petualanganmu.</p></div></article>
    </div>
    <button class="btn btn-primary btn-large dashboard-level-button" data-action="levels">PILIH LEVEL <span>&rarr;</span></button>
    </section>`;
    this.hydrateCharacterThumbnails(this.root);
    this.scheduleLevelCarPreviewPreload();
  }

  scheduleLevelCarPreviewPreload() {
    if (this.levelCarPreviewPreloadScheduled) return;
    this.levelCarPreviewPreloadScheduled = true;

    const preload = () => {
      if (!this.root.querySelector('.dashboard-screen')) {
        this.levelCarPreviewPreloadScheduled = false;
        return;
      }
      this.characterThumbnailsReady
        .then(() => {
          if (!this.root.querySelector('.dashboard-screen')) {
            this.levelCarPreviewPreloadScheduled = false;
            return null;
          }
          return import('./LevelCarPreview.js').then(({ getLevelCarPreview }) => getLevelCarPreview());
        })
        .catch((error) => {
          console.warn('Preload pratinjau Honda gagal; halaman akan mencoba saat dibuka.', error);
        });
    };

    const scheduleWhenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(preload);
      } else {
        window.setTimeout(preload, 0);
      }
    };

    window.requestAnimationFrame(() => window.requestAnimationFrame(scheduleWhenIdle));
  }

  levels(data) {
  
  const levelCards = data.levels.map((level, index) => {
      const done = data.completed.includes(level.id);
      const locked = index > 0 && !data.completed.includes(data.levels[index - 1].id);
      const levelAccent = index === 2 ? '#3479e5' : index === 4 ? '#e05252' : level.accent;
      const cardTitle = level.materialTitle ?? level.name.replace(' \u2192 ', '–');
      const routeName = level.name.replace(' \u2192 ', ' – ');
      return `<article class="level-card ${locked ? 'locked' : ''}" style="--level-accent:${levelAccent}">
        <div class="level-number"><span class="level-number-label">LEVEL 0${index + 1}</span><span class="level-route-name">${escapeHTML(routeName)}</span>${done ? '<span class="level-completed">SELESAI</span>' : ''}</div><h2>${escapeHTML(cardTitle)}</h2><div class="level-material"><div class="level-car-preview"><img class="level-car-preview-image" data-level-car-preview alt="" aria-hidden="true"></div><div class="level-material-copy"><h3>${escapeHTML(level.subtitle)}</h3><p>${escapeHTML(level.description)}</p></div></div>
        <button class="btn ${locked ? 'btn-locked' : 'btn-level'}" data-action="select-level" data-level="${level.id}" ${locked ? 'disabled' : ''}>${locked ? '\u{1F512} Terkunci' : done ? 'Mainkan lagi →' : 'Pilih level →'}</button>
      </article>`;
    }).join('');
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="levels-content-panel"><div class="content-heading"><p class="eyebrow">JALAN TRANS SULAWESI · SULAWESI TENGGARA</p><h1>Kolaka Utara menuju Kendari</h1><p>Lima tahap perjalanan dengan lingkungan yang terinspirasi kawasan Sulawesi Tenggara. Bentuk lintasan bersifat tematik, bukan pengukuran GPS.</p></div>
      <div class="level-grid">${levelCards}</div></div><div class="multiplayer-strip"><span>👥</span><div><strong>Main bersama teman?</strong><small>Gunakan satu perangkat dan bergantian menyelesaikan level.</small></div><button class="btn btn-secondary" data-action="local-mode">Main berdua</button><button class="btn btn-ghost" data-action="leaderboard">Leaderboard</button></div></section>`;
    this.hydrateLevelCarPreviews();
  }

  hydrateLevelCarPreviews() {
    const images = [...this.root.querySelectorAll('[data-level-car-preview]')];
    if (!images.length) return;
    this.characterThumbnailsReady.then(() => import('./LevelCarPreview.js'))
      .then(({ getLevelCarPreview }) => getLevelCarPreview()).then((source) => {
      for (const image of images) {
        if (image.isConnected) image.src = source;
      }
    }).catch((error) => {
      console.warn('Preview Honda Jazz pada kartu level tidak dapat dibuat.', error);
    });
  }

  chooseMode(mode, data) {
    this.pendingMode = mode;
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
    <div class="content-card narrow"><p class="eyebrow">SIAP BERANGKAT?</p><h1>${mode === 'local' ? 'Pemain bergantian' : 'Petualangan solo'}</h1><p>${mode === 'local' ? 'Masukkan nama dua pemain. Masing-masing akan mendapat satu giliran pada level yang dipilih.' : 'Siapkan nama petualangmu sebelum memilih level.'}</p>
    <label class="field-label">Nama pemain 1<input id="player-name" maxlength="24" value="${escapeHTML(data.playerName)}" placeholder="Nama petualang"></label>
    ${mode === 'local' ? '<label class="field-label">Nama pemain 2<input id="player-two" maxlength="24" value="Teman" placeholder="Nama teman"></label>' : ''}
    <button class="btn btn-primary dashboard-continue-button" data-action="confirm-mode">Pilih level →</button></div></section>`;
  }

  gameInfo() {
    this.root.innerHTML = `<section class="page-shell game-info-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="content-card game-info-card"><p class="eyebrow">INFORMASI GIM</p><h1>Informasi GIM</h1>
        <div class="game-info-accordion">
          <details class="game-info-section" open><summary><span aria-hidden="true">&#127918;</span> Tentang Gim</summary><div class="game-info-copy"><p>Gim ini menghadirkan lima level petualangan yang melintasi rute wilayah Sulawesi Tenggara. Pemain akan menjelajahi lintasan permainan yang interaktif, kompetitif, dan menyenangkan, sambil menyelesaikan tantangan soal Fisika di setiap checkpoint.</p>
            <div class="game-info-levels">
              <article><h3>Level 01 — Kolaka Utara–Kolaka</h3><p>Berpetualang melintasi rute dengan menjawab soal tentang GERAK LURUS BERATURAN (GLB) setelah mencapai checkpoint.</p></article>
              <article><h3>Level 02 — Kolaka–Kolaka Timur</h3><p>Berpetualang melintasi rute dengan menjawab soal tentang GERAK LURUS BERUBAH BERATURAN (GLBB) setelah mencapai checkpoint.</p></article>
              <article><h3>Level 03 — Kolaka Timur–Konawe</h3><p>Berpetualang melintasi rute dengan menjawab soal tentang GERAK DIPERCEPAT setelah mencapai checkpoint.</p></article>
              <article><h3>Level 04 — Konawe–Konawe Selatan</h3><p>Berpetualang melintasi rute dengan menjawab soal tentang GERAK DIPERLAMBAT setelah mencapai checkpoint.</p></article>
              <article><h3>Level 05 — Konawe Selatan–Kendari</h3><p>Berpetualang melintasi rute dengan menjawab soal tentang GRAND PRIX FISIKA sebagai tantangan akhir setelah mencapai checkpoint.</p></article>
            </div></div></details>
          <details class="game-info-section"><summary><span aria-hidden="true">&#127918;</span> Cara Bermain</summary><div class="game-info-copy"><ul><li>Kendalikan kendaraan dengan WASD atau tombol panah. Tahan klik kiri dan geser mouse secara horizontal pada area permainan untuk mengarahkan kendaraan.</li><li>Pada perangkat sentuh, gunakan D-pad untuk mengarahkan dan tombol gas/rem untuk mengatur laju.</li><li>Tekan Space untuk meminta jeda. Permainan tidak dapat dijeda saat panel kuis checkpoint sedang terbuka.</li><li>Setiap level menempuh jarak 300 m; kuis muncul di checkpoint pada jarak 270 m. Jawab tiga soal dalam batas waktu level: 60, 55, 50, 45, atau 40 detik.</li><li>Jawab minimal 2 dari 3 soal dengan benar untuk melewati checkpoint. Jika belum berhasil, tersedia hingga tiga percobaan; setelah percobaan terakhir, perjalanan tetap dapat dilanjutkan.</li></ul></div></details>
          <details class="game-info-section"><summary><span aria-hidden="true">&#127942;</span> Sistem Penilaian</summary><div class="game-info-copy"><ul><li>Jawaban benar: +150 poin dan 5 koin bonus kuis. Jawaban salah: −50 poin.</li><li>Checkpoint berhasil dilewati: +200 poin. Tiga jawaban benar pada percobaan pertama memberi tambahan +300 poin.</li><li>Setiap percobaan checkpoint yang gagal memberi penalti −50 poin. Kegagalan pada percobaan terakhir mendapat penalti tambahan −200 poin.</li><li>Terkena rintangan: −100 poin. Setiap koin yang dikumpulkan langsung di lintasan bernilai 10 poin.</li><li>Skor akhir level = skor jawaban, checkpoint, kegagalan, dan rintangan + (koin lintasan × 10). Koin bonus jawaban kuis dicatat terpisah dan tidak masuk pengali koin lintasan.</li><li>Skor level dijumlahkan untuk skor perjalanan. Peringkat perjalanan: Penjelajah Pemula (di bawah 1.000 poin), Pengemudi Andal (1.000–1.999), Adventure (2.000–2.999), dan Ahli Fisika (mulai 3.000 poin).</li></ul></div></details>
          <details class="game-info-section"><summary><span aria-hidden="true">&#128218;</span> Referensi</summary><div class="game-info-copy">
            <h3>Aset Visual</h3>
            <ul>
              <li>Honda Fit GK5 oleh flopchik — <a href="https://sketchfab.com/3d-models/honda-fit-gk5-a8204f405b5b44f6a6e2fcc927ae03b9" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Rumah kayu panggung oleh iGauravRajput — <a href="https://sketchfab.com/3d-models/rusty-roof-wooden-house-1-3d-model-free-ba768313ebf84f18b08956611adbd41f" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Rumah tua oleh Yury Misiyuk — <a href="https://sketchfab.com/3d-models/old-house-19a1121bab5a4aaaad4d973abe5b61cb" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Rumah batu oleh eventdesignws — <a href="https://sketchfab.com/3d-models/rumah8ws-82aa644d85c144e1a4c3549127b0351a" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Gedung The closed EMS oleh knjaq — <a href="https://sketchfab.com/3d-models/the-closed-ems-building-game-ready-570dc7c438824d8c912112400470a62a" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://sketchfab.com/licenses" target="_blank" rel="license noopener noreferrer">Sketchfab Standard</a>.</li>
              <li>Pakis oleh POLYSCAN — <a href="https://sketchfab.com/3d-models/fern-grass-01-b0a96490483a48d2877d2ed8abc9e436" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Model kerucut yang dipetakan sebagai road sign oleh phantasticc — <a href="https://sketchfab.com/3d-models/cone-fe5f7ae3a3274892ab47189102e378d0" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Tanaman padi oleh dario scaramuzza — <a href="https://sketchfab.com/3d-models/rice-plant-68fd8a9b358144d895e3f7838e33e2a1" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="license noopener noreferrer">CC BY-NC 4.0</a>.</li>
              <li>Rumput realistis oleh Digital screen official — <a href="https://sketchfab.com/3d-models/realistics-grass-06-b5956b7d4d1f4ff6ae1dd1320dab0d12" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Tanaman tropis oleh alint — <a href="https://sketchfab.com/3d-models/tropical-plant-3ee280726f1f496e9b2377d43b4cbb2d" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Pohon low-poly oleh 00amza — <a href="https://sketchfab.com/3d-models/tree-low-poly-lowpoly-73201f05280d48dcb10ed4ca362d69f8" target="_blank" rel="noopener noreferrer">Sketchfab</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a>.</li>
              <li>Karakter Pupil Standing dan Pupil Girl oleh Polyfork: <a href="https://polyfork.dev/asset/pupil-standing-0bd6d5" target="_blank" rel="noopener noreferrer">Pupil Standing</a> dan <a href="https://polyfork.dev/asset/pupil-seated-597f54" target="_blank" rel="noopener noreferrer">Pupil Girl</a>. Metadata model mencatat <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="license noopener noreferrer">CC BY 4.0</a> atau <a href="https://polyfork.dev/licensing" target="_blank" rel="license noopener noreferrer">ketentuan lisensi Polyfork</a>.</li>
              <li>Pohon pisang dan palem oleh Innerscene Corp — <a href="https://innerscene.com/" target="_blank" rel="noopener noreferrer">Innerscene</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="license noopener noreferrer">CC0 1.0</a>.</li>
              <li>DM Sans dan Outfit — <a href="https://fonts.google.com/specimen/DM+Sans" target="_blank" rel="noopener noreferrer">Google Fonts: DM Sans</a> dan <a href="https://fonts.google.com/specimen/Outfit" target="_blank" rel="noopener noreferrer">Outfit</a>; keduanya berlisensi <a href="https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt" target="_blank" rel="license noopener noreferrer">SIL Open Font License</a> (<a href="https://github.com/google/fonts/blob/main/ofl/outfit/OFL.txt" target="_blank" rel="license noopener noreferrer">Outfit OFL</a>).</li>
              <li>Sumber model bangunan, kabin, pinus, penghalang, dan fasilitas jalan lainnya serta ilustrasi hero belum tercatat secara cukup spesifik di proyek untuk diberi atribusi resmi.</li>
            </ul>

            <h3>Aset Audio dan Efek</h3>
            <ul>
              <li>Musik latar “Pixel Adventure” oleh BackgroundMusicMaster — <a href="https://pixabay.com/music/video-games-pixel-adventure-382649/" target="_blank" rel="noopener noreferrer">Pixabay</a>, <a href="https://pixabay.com/service/license-summary/" target="_blank" rel="license noopener noreferrer">Pixabay Content License</a>.</li>
              <li>Audio “Car Engine Start, Idle, and Revving” oleh NHumphrey — <a href="https://freesound.org/people/NHumphrey/sounds/200973/" target="_blank" rel="noopener noreferrer">Freesound</a>, <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="license noopener noreferrer">CC0</a>. Berkas MP3-nya tersimpan di proyek, tetapi tidak dipanggil oleh kode permainan saat ini.</li>
              <li>Efek mesin, tombol, jawaban, koin, dan hadiah yang aktif dibuat dengan Web Audio API di dalam kode gim; efek tersebut bukan file audio eksternal.</li>
            </ul>

            <h3>Teknologi Pengembangan</h3>
            <ul>
              <li><a href="https://threejs.org/" target="_blank" rel="noopener noreferrer">Three.js</a> 0.170.0 — <a href="https://github.com/mrdoob/three.js/blob/dev/LICENSE" target="_blank" rel="license noopener noreferrer">MIT License</a>.</li>
              <li><a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">Vite</a> 6.4.5 — <a href="https://github.com/vitejs/vite/blob/main/LICENSE" target="_blank" rel="license noopener noreferrer">MIT License</a>.</li>
              <li>JavaScript ES Modules, WebGL, Canvas, dan Web Audio API.</li>
            </ul>

            <h3>Sumber Materi</h3>
            <ul>
              <li><a href="https://static.sc.cloudapp.web.id/content/pdf/bukuteks/kurikulum21/Fisika-BG-KLS-XI.pdf" target="_blank" rel="noopener noreferrer">Buku Panduan Guru Fisika untuk SMA/MA Kelas XI (PDF)</a>, Marianna Magdalena Radjawane, Alvius Tinambunan, dan Suntar Jono; Pusat Perbukuan, Kemendikbudristek, 2022; ISBN 978-623-472-724-1. Lihat juga <a href="https://buku.kemendikdasmen.go.id/hasil-penilaian/987af67b-0765-43c7-8998-742d3fe65aad?type=btp" target="_blank" rel="noopener noreferrer">katalog SIBI</a>.</li>
              <li>Bank soal aktif berisi 50 soal, tetapi file proyek tidak mencatat sumber rujukan untuk setiap butir.</li>
            </ul>
          </div></details>
          <details class="game-info-section"><summary><span aria-hidden="true">&#128104;&#8205;&#127979;</span> Profil Pengembang</summary><div class="game-info-copy"><dl class="game-info-profile"><div><dt>Nama</dt><dd>Arkam Umar</dd></div><div><dt>Instansi</dt><dd>SMAN 1 Kodeoha</dd></div><div><dt>Mata Pelajaran</dt><dd>Fisika</dd></div><div><dt>Surel</dt><dd><a href="mailto:arkam51@guru.sma.belajar.id">arkam51@guru.sma.belajar.id</a></dd></div><div><dt>Tahun Pembuatan</dt><dd>2026</dd></div><div><dt>Versi</dt><dd>2</dd></div></dl></div></details>
        </div>
      </div>${renderFooter()}</section>`;
  }

  materials() {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
    <div class="materials-panel"><div class="content-heading"><p class="eyebrow">LAB FISIKA INTERAKTIF</p><h1>Rumusnya bergerak!</h1><p>Ubah variabel dan amati bagaimana gerak benda berubah.</p></div>
    <div class="material-grid"><article class="content-card formula-card"><div class="formula-car-preview" data-material-car-preview><span class="formula-car-fallback" aria-hidden="true">&#128663;</span><img class="formula-car-image" alt="Honda Jazz GK5 putih" aria-hidden="true"></div><p class="eyebrow">GERAK LURUS BERATURAN</p><h2>GLB</h2><p>Gerak pada lintasan lurus dengan kecepatan tetap. Percepatan benda sama dengan nol.</p><div class="formula-box">s = v × t</div><label class="slider-label">Kecepatan <b><output id="sim-speed-value">10</output> m/s</b><input id="sim-speed" type="range" min="2" max="24" value="10"></label><label class="slider-label">Waktu <b><output id="sim-time-value">5</output> s</b><input id="sim-time" type="range" min="1" max="10" value="5"></label><p class="calculation">Jarak: <strong id="sim-distance">50</strong> m</p></article>
    <article class="content-card formula-card"><div class="formula-car-preview" data-material-car-preview><span class="formula-car-fallback" aria-hidden="true">&#127950;</span><img class="formula-car-image" alt="Honda Jazz GK5 putih" aria-hidden="true"></div><p class="eyebrow">GERAK LURUS BERUBAH BERATURAN</p><h2>GLBB</h2><p>Kecepatan berubah secara teratur karena percepatan konstan.</p><div class="formula-box">v = v₀ + at<br><small>s = v₀t + ½at²</small></div><label class="slider-label">Kecepatan awal <b><output id="sim-v0-value">2</output> m/s</b><input id="sim-v0" type="range" min="0" max="12" value="2"></label><label class="slider-label">Percepatan <b><output id="sim-accel-value">2</output> m/s²</b><input id="sim-accel" type="range" min="1" max="6" value="2"></label><label class="slider-label">Waktu <b><output id="sim-glbb-time-value">4</output> s</b><input id="sim-glbb-time" type="range" min="1" max="8" value="4"></label><p class="calculation">Kecepatan akhir: <strong id="sim-final-speed">10</strong> m/s · Jarak: <strong id="sim-glbb-distance">24</strong> m</p></article></div>
    <article class="content-card graph-card"><h2>Grafik posisi–waktu GLB</h2><p>Gradien grafik posisi terhadap waktu menunjukkan kecepatan.</p><canvas id="material-graph" width="720" height="240" aria-label="Grafik posisi terhadap waktu"></canvas></article>
    <div class="material-grid graph-pair"><article class="content-card graph-card"><h2>Grafik kecepatan–waktu GLBB</h2><p>Gradien menunjukkan percepatan; luas di bawah garis menunjukkan perpindahan.</p><canvas id="velocity-graph" width="720" height="240" aria-label="Grafik kecepatan terhadap waktu"></canvas></article>
    <article class="content-card graph-card"><h2>Grafik percepatan–waktu</h2><p>Percepatan konstan membentuk garis horizontal.</p><canvas id="acceleration-graph" width="720" height="240" aria-label="Grafik percepatan terhadap waktu"></canvas></article></div></div>
    <button class="btn btn-primary" data-action="levels">Siap bermain →</button>${renderFooter()}</section>`;
    this.hydrateMaterialCarPreviews();
  }

  hydrateMaterialCarPreviews() {
    const previews = [...this.root.querySelectorAll('[data-material-car-preview]')];
    if (!previews.length) return;
    this.characterThumbnailsReady.then(() => import('./LevelCarPreview.js'))
      .then(({ getLevelCarPreview }) => getLevelCarPreview()).then((source) => {
      for (const preview of previews) {
        const image = preview.querySelector('.formula-car-image');
        if (!image) continue;
        image.addEventListener('error', () => preview.classList.add('is-fallback'), { once: true });
        image.src = source;
      }
    }).catch((error) => {
      for (const preview of previews) preview.classList.add('is-fallback');
      console.warn('Pratinjau Honda Jazz pada kartu Materi tidak dapat dibuat.', error);
    });
  }
  settings(data) {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow">
      <p class="eyebrow">PREFERENSI</p><h1>Pengaturan</h1><label class="setting-row"><span><strong>Efek suara</strong><small>Suara koin dan jawaban kuis</small></span><input type="checkbox" data-setting="sound" ${data.settings.sound ? 'checked' : ''}></label>
      <label class="setting-row"><span><strong>Musik latar</strong><small>Melodi sederhana selama bermain</small></span><input type="checkbox" data-setting="music" ${data.settings.music ? 'checked' : ''}></label>
      <p class="muted-note">Suara dimulai setelah interaksi pertama dan dapat dimatikan kapan saja.</p></div></section>`;
  }

  profile(data) {
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card narrow">
      <p class="eyebrow">KARTU PETUALANG</p><div class="profile-avatar">🧑🏻‍🚀</div><h1>${escapeHTML(data.playerName)}</h1><p>Level selesai: <strong>${data.completed.length}/5</strong></p><p>Skor terbaik: <strong>${data.bestScore || 0}</strong></p>
      <div class="achievement-list"><strong>Pencapaian</strong><p>${data.completed.length ? data.completed.map((id) => `🏁 ${escapeHTML(data.levels.find((level) => level.id === id)?.name ?? id)}`).join('<br>') : 'Selesaikan level untuk membuka pencapaian.'}</p></div>
      <button class="btn btn-secondary" data-action="history">Lihat riwayat permainan</button><button class="btn btn-ghost" data-action="leaderboard">Leaderboard lokal</button></div></section>`;
  }

  history(data) {
    const list = [...data.records].reverse().slice(0, 20);
    const playerCharacterId = data.playerCharacterId || '';
    this.root.innerHTML = `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header><div class="content-card">
      <div class="history-player-summary"><p class="eyebrow">PETUALANG</p><h1><img class="character-thumbnail character-thumbnail-history" data-character-thumbnail="${escapeHTML(playerCharacterId)}" src="${NEUTRAL_CHARACTER_THUMBNAIL}" alt="">${escapeHTML(data.playerName)}</h1><div class="history-summary-stats"><div><span>REKOR TERBAIK</span><strong>${data.bestScore ? `${data.bestScore} poin` : 'Belum ada skor'}</strong></div><div><span>TOTAL POIN</span><strong>${data.totalPoints} poin</strong></div><div><span>LEVEL SELESAI</span><strong>${data.completedCount}/5</strong></div></div></div>
      <p class="eyebrow history-records-heading">CATATAN PETUALANGAN</p><h2 class="history-records-title">Riwayat permainan</h2>${list.length ? `<div class="history-list">${list.map((record) => `<div><span>🏁</span><div><strong><img class="character-thumbnail character-thumbnail-history-record" data-character-thumbnail="${escapeHTML(record.playerCharacterId || '')}" src="${NEUTRAL_CHARACTER_THUMBNAIL}" alt="">${escapeHTML(record.playerName)}</strong><small>${escapeHTML(record.levelName)} · ${new Date(record.date).toLocaleString('id-ID')} · ${record.accuracy}% akurasi</small></div><b>${record.score} pts</b></div>`).join('')}</div>` : '<div class="empty-state">Belum ada permainan. Petualangan pertamamu menunggu!</div>'}</div></section>`;
    this.hydrateCharacterThumbnails(this.root);
  }

  game(level, playerName, turn, mode) {
    
    this.root.innerHTML = `
      <main class="game-screen">

        <div class="game-stage">
          <canvas id="game-canvas" aria-label="Scene permainan 3D"></canvas>

          <div class="game-topbar">
            <button class="icon-button" data-action="home" aria-label="Keluar">←</button>
            <div class="game-level">
              <span>🚗</span>
              <div>
                <strong>${escapeHTML(level.name)}</strong>
                <small>
                  ${escapeHTML(level.route)} · ${escapeHTML(playerName)}${mode === 'local' ? ` · Pemain ${turn + 1}` : ''}
                </small>
              </div>
            </div>
          </div>

          <div class="hud">
            <div class="hud-row">
              <div class="hud-card">
                <small>KECEPATAN</small>
                <strong id="hud-speed">0 km/j</strong>
              </div>
              <div class="hud-card">
                <small>PERCEPATAN</small>
                <strong id="hud-acceleration">0 m/s²</strong>
              </div>
              <div class="hud-card">
                <small>JARAK</small>
                <strong id="hud-distance">0 m</strong>
              </div>
              <div class="hud-card">
                <small>WAKTU</small>
                <strong id="hud-time">0 dtk</strong>
              </div>
              <div class="hud-card coin-hud">
                <small>KOIN</small>
                <strong>🪙 <span id="hud-coins">0</span></strong>
              </div>
            </div>
            <div class="progress-track">
              <div id="hud-progress"></div>
            </div>
          </div>

          <div class="game-tip">
            WASD / Panah · Drag mouse untuk setir
            <span>· Checkpoint tiap 30 m</span>
          </div>

          <div class="touch-controls" aria-label="Kontrol layar sentuh">
            <div class="touch-control-row">
              <div class="touch-dpad touch-dpad-left" aria-label="Setir kiri">
                <button data-control="left" aria-label="Setir kiri">◀</button>
              </div>

                          <div class="touch-actions" aria-label="Pedal kendaraan">

    <button class="pedal-button pedal-brake"
            data-control="down"
            aria-label="Rem"
            title="Rem">
        <span class="pedal-label">BRAKE</span>
        <span class="pedal-icon">Ⅱ</span>
    </button>

    <button class="pedal-button pedal-gas"
            data-control="up"
            aria-label="Gas"
            title="Gas">
        <span class="pedal-label">THROTTLE</span>
        <span class="pedal-icon">↑</span>
    </button>

</div>

              <div class="touch-dpad touch-dpad-right" aria-label="Setir kanan">
                <button data-control="right" aria-label="Setir kanan">▶</button>
              </div>
            </div>

                      </div>
        </div>

        <button class="touch-pause-button" data-action="pause" aria-label="Jeda" title="Jeda">⏸</button>

        <div id="game-modal"></div>

      </main>`;
  }


  question(question, index, total, attempt, secondsLeft) {
    const options = question.options.map((option, i) => `<button class="answer-option" data-action="answer" data-option="${i}"><span>${String.fromCharCode(65 + i)}</span>${escapeHTML(option)}</button>`).join('');
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card"><div class="quiz-progress"><span>SOAL ${index + 1} / ${total}</span><span>Percobaan ${attempt} / 3</span></div><div class="quiz-progress-track"><i style="width:${(index + 1) / total * 100}%"></i></div><p class="checkpoint-timer">Waktu tersisa: <strong id="checkpoint-countdown">${secondsLeft}</strong> detik</p><h2>${escapeHTML(question.question)}</h2><div class="answer-grid">${options}</div></section></div>`;
  }

  answerFeedback(result, onContinueLabel, secondsLeft) {
    const correct = result.correct;
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card feedback-card ${correct ? 'is-correct' : 'is-wrong'}"><div class="feedback-icon">${correct ? '🎉' : '💡'}</div><p class="eyebrow">${correct ? 'BENAR · +150 POIN · +5 KOIN' : 'SALAH · −50 POIN'}</p><p class="checkpoint-timer">Waktu tersisa: <strong id="checkpoint-countdown">${secondsLeft}</strong> detik</p><h2>${correct ? 'Hebat, petualang!' : 'Yuk pahami konsepnya!'}</h2><div class="formula-box">${escapeHTML(result.formula)}</div><p>${escapeHTML(result.explanation)}</p>${correct ? '' : `<p class="correct-answer">Jawaban benar: <strong>${escapeHTML(result.correctAnswer)}</strong></p>`}<button class="btn btn-primary" data-action="continue">${onContinueLabel}</button></section></div>`;
  }

  checkpointResult(result) {
    const heading = result.passed ? 'Checkpoint berhasil!' : result.canRetry ? 'Checkpoint belum lolos' : 'Checkpoint gagal';
    const detail = result.passed
      ? `Kamu menjawab ${result.correct} dari 3 soal dengan benar. +200 poin${result.perfect ? ' dan bonus sempurna +300 poin' : ''}.`
      : `Jawaban benar ${result.correct} dari 3. Penalti percobaan −50 poin.${result.canRetry ? ' Kamu mendapat percobaan baru dengan soal berbeda.' : ' Penalti tambahan −200 poin; perjalanan tetap dapat dilanjutkan.'}`;
    const action = result.passed ? 'continue-checkpoint' : result.canRetry ? 'retry-attempt' : 'continue-after-fail';
    const label = result.passed ? 'Lanjutkan perjalanan →' : result.canRetry ? 'Ulangi dengan soal baru →' : 'Lanjutkan perjalanan →';
    const rewardDetails = {
      perfect: { label: 'PERFECT CHECKPOINT', title: 'Sempurna!', detail: '3 dari 3 jawaban benar pada percobaan pertama.' },
      comeback: { label: 'COMEBACK', title: 'Kamu bangkit!', detail: 'Berhasil melewati checkpoint setelah retry.' },
      checkpoint: { label: 'CHECKPOINT CLEAR', title: 'Checkpoint ditaklukkan!', detail: 'Target minimal 2 dari 3 jawaban benar tercapai.' }
    };
    const reward = result.reward && rewardDetails[result.reward.type];
    let rewardMarkup = reward
      ? `<div class="checkpoint-reward reward-${result.reward.type}" role="status"><div class="reward-star" aria-hidden="true">★</div><div><p class="reward-label">${reward.label}</p><strong>${reward.title}</strong><p>${reward.detail}</p></div></div>`
      : '';
    const rewardEmblems = {
      perfect: '<svg class="reward-emblem reward-emblem-star" viewBox="0 0 100 100" role="img" aria-label="Emblem bintang Perfect Checkpoint"><polygon class="emblem-depth" points="50,7 62,35 94,38 69,58 77,91 50,73 23,91 31,58 6,38 38,35"></polygon><polygon class="emblem-face" points="50,3 62,31 94,34 69,54 77,87 50,69 23,87 31,54 6,34 38,31"></polygon><path class="emblem-highlight" d="M39 29l11-20 8 19"></path></svg>',
      comeback: '<svg class="reward-emblem reward-emblem-comeback" viewBox="0 0 100 100" role="img" aria-label="Emblem Comeback"><path class="emblem-ring" d="M76 54A28 28 0 1 1 57 25"></path><path class="emblem-arrow" d="M55 10l22 2-12 18"></path><path class="emblem-rise" d="M27 67l14-15 10 9 20-24"></path></svg>',
      checkpoint: '<svg class="reward-emblem reward-emblem-shield" viewBox="0 0 100 100" role="img" aria-label="Emblem Checkpoint Clear"><path class="emblem-depth" d="M50 7l34 12v25c0 23-14 38-34 49C30 82 16 67 16 44V19L50 7z"></path><path class="emblem-face" d="M50 3l34 12v25c0 23-14 38-34 49C30 78 16 63 16 40V15L50 3z"></path><path class="emblem-check" d="M30 48l13 13 27-29"></path></svg>'
    };
    if (reward) {
      rewardMarkup = `<div class="checkpoint-reward reward-${result.reward.type}" role="status"><div class="reward-emblem-wrap">${rewardEmblems[result.reward.type]}</div><div><p class="reward-label">${reward.label}</p><strong>${reward.title}</strong><p>${reward.detail}</p></div></div>`;
    }
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card feedback-card ${result.passed ? 'is-correct' : 'is-wrong'} ${reward ? 'has-reward' : ''}"><div class="feedback-icon">${result.passed ? '🏁' : '📘'}</div><p class="eyebrow">PERCOBAAN ${result.attempt} / 3</p><h2>${heading}</h2>${rewardMarkup}<p>${detail}</p><button class="btn btn-primary" data-action="${action}">${label}</button></section></div>`;
  }

  updateCheckpointTimer(secondsLeft) {
    const timer = this.root.querySelector('#checkpoint-countdown');
    if (timer) timer.textContent = String(secondsLeft);
  }

  clearModal() {
    const modal = this.root.querySelector('#game-modal');
    if (modal) modal.innerHTML = '';
  }

  pause() {
    this.root.querySelector('#game-modal').innerHTML = `<div class="modal-scrim"><section class="quiz-card pause-card"><div class="feedback-icon">⏸️</div><p class="eyebrow">WAKTU ISTIRAHAT</p><h2>Permainan dijeda</h2><p>Tarik napas, lalu lanjutkan petualanganmu.</p><div class="pause-actions"><button class="btn btn-ghost" data-action="quit">◀ Keluar ke beranda</button><button class="btn btn-primary" data-action="resume">▶ Lanjutkan</button></div></section></div>`;
  }

  evaluation(result, backgroundCanvas = null) {
    this.root.innerHTML = this.evaluationView.render(result);
    const background = this.root.querySelector('.score-background');
    if (backgroundCanvas && background) background.append(backgroundCanvas);
  }

  leaderboard(entries) {
    this.root.innerHTML = this.leaderboardView.render(entries);
  }

  notice(message, { kind = 'generic' } = {}) {
    const isGameplayNotice = kind === 'coin' || kind === 'obstacle';
    if (!isGameplayNotice) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      this.root.append(toast);
      window.setTimeout(() => toast.remove(), 1800);
      return;
    }

    const touchLayout = window.matchMedia('(pointer: coarse), (max-width: 760px)').matches;
    let toast = this.gameplayToast;
    if (!toast?.isConnected) {
      toast = document.createElement('div');
      this.gameplayToast = toast;
      this.root.append(toast);
    }

    toast.className = touchLayout
      ? `toast toast--gameplay-anchored${kind === 'obstacle' ? ' toast--obstacle' : ''}`
      : 'toast';
    toast.textContent = message;

    if (touchLayout) {
      toast.style.visibility = 'hidden';
      if (!this.gameplayToastReposition) {
        this.gameplayToastReposition = () => window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (this.gameplayToast?.isConnected && this.gameplayToast.classList.contains('toast--gameplay-anchored')) {
              this.positionGameplayNotices();
            }
          });
        });
        window.addEventListener('resize', this.gameplayToastReposition, { passive: true });
        window.addEventListener('orientationchange', this.gameplayToastReposition, { passive: true });
      }
      window.requestAnimationFrame(this.gameplayToastReposition);
    } else {
      this.clearGameplayToastReposition();
      toast.style.removeProperty('visibility');
      toast.style.removeProperty('left');
      toast.style.removeProperty('top');
    }

    window.clearTimeout(this.gameplayToastTimer);
    const timer = window.setTimeout(() => {
      if (this.gameplayToastTimer !== timer) return;
      toast.remove();
      if (this.gameplayToast === toast) this.gameplayToast = null;
      this.gameplayToastTimer = null;
      this.clearGameplayToastReposition();
      this.positionGameplayNotices();
    }, 1800);
    this.gameplayToastTimer = timer;
  }

  clearGameplayToastReposition() {
    if (!this.gameplayToastReposition) return;
    window.removeEventListener('resize', this.gameplayToastReposition);
    window.removeEventListener('orientationchange', this.gameplayToastReposition);
    this.gameplayToastReposition = null;
  }

  positionGameplayNotices() {
    const notices = [...this.root.querySelectorAll('.toast--gameplay-anchored')];
    if (!notices.length) return;

    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
    const isPortrait = viewportHeight >= viewportWidth;
    const anchor = this.root.querySelector(isPortrait ? '.progress-track' : '.touch-pause-button');
    if (!anchor) {
      notices.forEach((toast) => { toast.style.visibility = 'visible'; });
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    let top = anchorRect.bottom + 8;
    if (!isPortrait) {
      const hud = this.root.querySelector('.hud');
      if (hud) top = Math.max(top, hud.getBoundingClientRect().bottom + 8);
    }

    notices.forEach((toast) => {
      const toastWidth = toast.offsetWidth;
      const style = window.getComputedStyle(toast);
      const safeLeft = Number.parseFloat(style.getPropertyValue('--toast-safe-left')) || 0;
      const safeRight = Number.parseFloat(style.getPropertyValue('--toast-safe-right')) || 0;
      const safeTop = Number.parseFloat(style.getPropertyValue('--toast-safe-top')) || 0;
      const minLeft = safeLeft + 12;
      const maxLeft = Math.max(minLeft, viewportWidth - safeRight - 12 - toastWidth);
      const desiredLeft = isPortrait
        ? anchorRect.left + (anchorRect.width - toastWidth) / 2
        : anchorRect.right - toastWidth;
      const left = Math.min(maxLeft, Math.max(minLeft, desiredLeft));

      toast.style.left = `${left}px`;
      toast.style.top = `${Math.max(top, safeTop + 8)}px`;
      toast.style.visibility = 'visible';
      top += toast.offsetHeight + 16;
    });
  }
}
