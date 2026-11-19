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
    let recommendations = result.missedTopics.length
      ? `<div class="recommendation"><h3>📚 Materi yang perlu diulang</h3><ul>${[...new Set(result.missedTopics)].map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul></div>`
      : result.perfect
        ? '<div class="recommendation"><h3>✨ Hebat!</h3><p>Semua soal checkpoint pertama dijawab benar.</p></div>'
        : '<div class="recommendation"><h3>📘 Terus berlatih</h3><p>Pelajari kembali materi checkpoint sebelum melanjutkan ke level berikutnya.</p></div>';
    const checkpointRewardSummary = [
      result.checkpointReward
        ? `<div class="award-badge checkpoint-award reward-${escapeHTML(result.checkpointReward.type)}">★ ${escapeHTML(result.checkpointReward.type.toUpperCase())} CHECKPOINT</div>`
        : '',
      result.grandVictory
        ? '<div class="award-badge grand-victory-award"><span class="reward-star" aria-hidden="true">★</span> GRAND VICTORY · PERJALANAN SELESAI</div>'
        : ''
    ].slice(0, 1).join('');
    const grandVictoryMarkup = result.grandVictory
      ? '<section class="grand-victory-panel" aria-label="Grand Victory"><div class="grand-victory-emblem-wrap"><svg class="grand-victory-emblem" viewBox="0 0 120 120" role="img" aria-label="Emblem Grand Victory"><circle class="grand-emblem-ring" cx="60" cy="60" r="48"></circle><polygon class="grand-emblem-depth" points="60,13 73,45 108,48 81,69 89,104 60,84 31,104 39,69 12,48 47,45"></polygon><polygon class="grand-emblem-face" points="60,7 73,39 108,42 81,63 89,98 60,78 31,98 39,63 12,42 47,39"></polygon><path class="grand-emblem-highlight" d="M46 38l14-25 10 24"></path></svg></div><div><p class="grand-victory-kicker">PERJALANAN LEVEL 1–5 SELESAI</p><h2>GRAND VICTORY</h2><p>Seluruh perjalanan fisika berhasil kamu taklukkan.</p></div></section>'
      : '';
    recommendations = `${checkpointRewardSummary}${recommendations}`;
    return `<section class="page-shell results-shell">
      <div class="score-background" aria-hidden="true"></div>
      <header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon" aria-label="Logo fisika">⚛️</span> PHYSICS ADVENTURE <b>SULTRA</b></a><button class="btn btn-ghost" data-action="history">Riwayat ↗</button></header>
      <div class="result-card">
        <div class="result-confetti">🏁</div><p class="eyebrow">LEVEL SELESAI</p><h1>${escapeHTML(result.level.name)}</h1>
        <p class="result-player">Petualang: <strong>${escapeHTML(result.playerName)}</strong></p>
        <div class="score-highlight"><strong>${result.score}</strong><span>POIN</span></div>
        ${grandVictoryMarkup}<div class="result-stats">
          <div><strong>${result.correct}</strong><span>Benar</span></div><div><strong>${result.wrong}</strong><span>Salah</span></div>
          <div><strong>${result.accuracy}%</strong><span>Akurasi</span></div><div><strong>${result.elapsed.toFixed(1)} dtk</strong><span>Waktu berkendara</span></div>
          <div><strong>${result.coins}</strong><span>Koin</span></div><div><strong>${result.attempts} / 3</strong><span>Percobaan</span></div>
        </div>
        <div class="mastery"><span>Checkpoint</span><strong>${result.checkpointPassed ? 'Lolos' : 'Gagal · perjalanan dilanjutkan'}</strong></div>
        <div class="mastery"><span>Penguasaan materi</span><strong>${status}</strong></div>
        <div class="award-badge">🏆 ${escapeHTML(result.rank)} · ${result.journeyScore} poin perjalanan</div>${recommendations}
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
