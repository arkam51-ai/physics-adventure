const safe = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

export class Leaderboard {
  render(entries) {
    const rows = [...entries].sort((a, b) => b.score - a.score).slice(0, 10);
    return `<section class="page-shell"><header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">⚡</span> PHYSICS ADVENTURE <b>3D</b></a><button class="btn btn-ghost" data-action="back">← Kembali</button></header>
      <div class="content-card narrow"><p class="eyebrow">LOCAL MULTIPLAYER</p><h1>🏆 Leaderboard</h1><p>Skor pemain tersimpan di perangkat ini.</p>
      ${rows.length ? `<ol class="leaderboard-list">${rows.map((entry, index) => `<li><span class="rank">${index + 1}</span><div><strong>${safe(entry.name)}</strong><small>${safe(entry.level)} · ${safe(new Date(entry.date).toLocaleDateString('id-ID'))}</small></div><b>${entry.score} pts</b></li>`).join('')}</ol>` : '<div class="empty-state">Belum ada hasil. Ajak teman bermain!</div>'}
      <button class="btn btn-primary" data-action="levels">Main lagi</button></div></section>`;
  }
}
