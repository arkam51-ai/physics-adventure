# PHYSICS ADVENTURE 3D

Gim edukasi browser untuk membantu siswa SMA Kelas XI memahami GLB dan GLBB melalui balapan 3D, checkpoint kuis, simulasi fisika, serta evaluasi hasil belajar.

## Fitur

- Tiga level dengan scene 3D Three.js, model kendaraan GLB, dan aset lingkungan yang dimuat modular dari `public/models/`.
- Simulasi kecepatan, percepatan, pengereman, jarak, dan perpindahan jalur.
- Kontrol WASD/panah, setir dengan drag mouse, D-pad virtual dan pedal layar sentuh; jeda/resume selama bermain.
- Sepuluh pertanyaan acak tanpa pengulangan per level, pembahasan rumus, skor dan bonus koin.
- Mode solo dan multiplayer lokal bergantian pada satu perangkat. Leaderboard tersimpan lokal.
- Evaluasi, rekomendasi belajar, riwayat, profil, simulasi GLB/GLBB, dan efek suara/musik sederhana.
- Footer identitas pengembang yang responsif dan konsisten pada beranda, materi, permainan, dan evaluasi.
- Progres disimpan melalui `localStorage`.

Mode multiplayer online tidak diaktifkan karena proyek ini belum memiliki konfigurasi backend/Firebase. Multiplayer lokal dapat dimainkan tanpa layanan tambahan.

## Menjalankan melalui VS Code

1. Pasang Node.js versi 18 atau lebih baru.
2. Buka folder proyek ini di VS Code.
3. Buka terminal terintegrasi (`Terminal > New Terminal`).
4. Jalankan:

   ```sh
   npm install
   npm run dev
   ```

5. Buka alamat lokal yang dicetak Vite di browser (biasanya `http://localhost:5173`).

Untuk memeriksa build produksi:

```sh
npm run build
npm run preview
```

## Kontrol

| Input | Aksi |
| --- | --- |
| Panah atas | Menambah kecepatan |
| Panah bawah | Mengerem |
| Panah kiri/kanan | Berpindah jalur |
| Spasi | Jeda/resume |
| Tombol di bawah scene | Kontrol sentuh untuk ponsel/tablet |

## Struktur

```text
public/
src/
  data/questions.js
  game/
  quiz/
  ui/
  main.js
  style.css
index.html
package.json
```

Scene permainan menggabungkan geometri Three.js dan aset GLB. Daftar model yang tersedia dicatat di `src/game/AssetLoader.js`, karena berkas dalam folder Vite `public/` disajikan sebagai aset statis dan tidak dapat ditemukan otomatis saat runtime browser. Resize observer dan perubahan orientasi memperbarui kamera serta renderer. Untuk menghapus data lokal, hapus key `physics-adventure-3d-save` dari penyimpanan situs di browser.
