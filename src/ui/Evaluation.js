import { renderFooter } from './Footer.js';

const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export class Evaluation {
  render(result) {
    const status = result.accuracy >= 90 ? 'Sangat Baik'
      : result.accuracy >= 80 ? 'Baik'
        : result.accuracy >= 70 ? 'Cukup'
          : 'Perlu Belajar Lagi';
    const award = result.accuracy === 100 ? 'Ultimate Motion Champion'
      : result.accuracy >= 90 ? 'Gold Physics Master'
        : result.accuracy >= 80 ? 'Silver Physics Explorer'
          : result.accuracy >= 70 ? 'Bronze Physics Explorer'
            : 'Terus berlatih!';
    const recommendations = result.missedTopics.length
      ? `<div class="recommendation"><h3>📚 Materi yang perlu diulang</h3><ul>${[...new Set(result.missedTopics)].map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div>`
      : '<div class="recommendation"><h3>✨ Hebat!</h3><p>Semua soal terjawab benar. Pertahankan pemahamanmu!</p></div>';
    return `<section class="page-shell results-shell">
      <header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="history">Riwayat ↗</button></header>
      <div class="result-card">
        <div class="result-confetti">🏁</div><p class="eyebrow">LEVEL SELESAI</p><h1>${escapeHTML(result.level.name)}</h1>
        <p class="result-player">Petualang: <strong>${escapeHTML(result.playerName)}</strong></p>
        <div class="score-highlight"><strong>${result.score}</strong><span>POIN</span></div>
        <div class="result-stats">
          <div><strong>${result.correct}</strong><span>Benar</span></div><div><strong>${result.wrong}</strong><span>Salah</span></div>
          <div><strong>${result.accuracy}%</strong><span>Akurasi</span></div><div><strong>${result.elapsed.toFixed(1)} dtk</strong><span>Waktu</span></div>
          <div><strong>${result.coins}</strong><span>Koin</span></div><div><strong>${result.average}</strong><span>Rata-rata nilai</span></div>
        </div>
        <div class="mastery"><span>Penguasaan materi</span><strong>${status}</strong></div>
        <div class="award-badge">🏆 ${award}</div>${recommendations}
        <div class="result-actions">
          ${result.nextPlayer ? '<button class="btn btn-primary" data-action="next-player">Giliran Pemain Berikutnya →</button>' : ''}
          ${result.mode === 'local' && !result.nextPlayer ? '<button class="btn btn-primary" data-action="leaderboard">Lihat Leaderboard</button>' : ''}
          <button class="btn btn-secondary" data-action="levels">Pilih Level</button><button class="btn btn-ghost" data-action="home">Beranda</button>
        </div>
      </div>
      ${renderFooter()}
    </section>`;
  }
}
