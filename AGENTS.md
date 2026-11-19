# Aturan Kerja Project Physics Adventure 3D

## Prinsip utama

Stabilitas proyek lebih penting daripada perubahan tambahan. Satu tugas berarti satu ruang lingkup kerja. Pengguna memiliki keputusan akhir atas perubahan.

## Scope lock

- Ubah hanya fitur dan file yang secara eksplisit diminta pengguna.
- Jangan mengubah, menghapus, memindahkan, atau merombak fitur di luar tugas.
- Jangan melakukan refaktor, optimasi, pembersihan kode, atau perubahan desain yang tidak diminta.
- Jangan memperluas ruang lingkup atas inisiatif sendiri.
- Jika menemukan masalah di luar ruang lingkup, catat dan laporkan kepada pengguna; tunggu persetujuan sebelum menanganinya.
- Jika tugas atau dampak perubahan belum jelas, periksa hal yang diperlukan dan minta klarifikasi sebelum melakukan perubahan yang bergantung padanya.

## Perlindungan fitur

Pertahankan semua fitur proyek yang sudah ada, termasuk namun tidak terbatas pada:

- Lima level permainan.
- Sistem fisika dan mekanisme permainan.
- Sistem skor, evaluasi, kuis, serta penyimpanan data pemain.
- Dashboard dan navigasi.
- Aset 3D, animasi, audio, dan efek visual.
- Fitur lain yang telah tersedia di proyek.

Jangan menganggap daftar ini sebagai batas seluruh fitur yang harus dilindungi.

## Sebelum mengubah file

1. Periksa isi dan kondisi awal setiap file target.
2. Periksa ketergantungan file target dengan fitur terkait.
3. Identifikasi file minimum yang diperlukan untuk tugas.
4. Periksa `git status` dan `git diff`, termasuk perubahan staged, unstaged, dan untracked.
5. Jangan menghapus, membatalkan, menimpa, atau memasukkan perubahan pengguna yang sudah ada tanpa instruksi.
6. Buat backup setiap file yang akan diubah sebelum mengedit. Gunakan nama unik dan pastikan tidak menimpa backup lama. Jika batas tugas melarang file backup di dalam proyek, simpan backup di lokasi sementara yang aman.
7. Jika tindakan yang diperlukan berpotensi merusak atau di luar izin pengguna, berhenti dan minta persetujuan sebelum melakukannya.

## Setelah mengubah file

1. Tinjau diff terhadap kondisi awal dan pastikan hanya ruang lingkup tugas yang berubah.
2. Jalankan build dan pemeriksaan yang relevan dengan perubahan. Jangan menyatakan pengujian lulus jika belum dijalankan.
3. Periksa fitur terkait untuk regresi sejauh dapat diuji.
4. Untuk verifikasi visual, gunakan aplikasi/browser aktual pada ukuran yang relevan. Jangan mengklaim hasil visual tanpa bukti.
5. Laporkan file yang diperiksa, diubah, dan dibuat sebagai backup.
6. Laporkan hasil build, pengujian yang benar-benar dilakukan, kegagalan, keterbatasan, dan masalah yang belum terselesaikan.
7. Jangan menyatakan tugas selesai jika persyaratan wajib masih belum diverifikasi atau belum terpenuhi.

## Batas perubahan dan keputusan

- Jangan mengubah source code, CSS, aset, konfigurasi, atau dokumentasi di luar file yang diminta.
- Jangan mengubah Lapisan 1, Lapisan 2, atau bagian lain saat tugas hanya meminta Lapisan 3.
- Jangan mengubah bank soal, sistem evaluasi, fisika, mekanisme permainan, penyimpanan, identitas level, navigasi, atau fungsi tombol kecuali diminta secara eksplisit.
- Jika target desain tidak dapat dicapai tanpa menurunkan keterbacaan atau merusak fungsi, laporkan kendala dan alternatif sebelum memilih solusi di luar ketentuan.
- Jangan melakukan operasi Git destruktif atau menimpa pekerjaan yang belum di-commit.
