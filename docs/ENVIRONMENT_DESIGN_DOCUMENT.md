# Environment Design Document — Physics Adventure 3D

## Tujuan dan cakupan

Dokumen ini menetapkan identitas visual lima lintasan Sulawesi Tenggara dan fondasi material terrain Stage 2.4. Implementasi tahap ini terbatas pada permukaan terrain di `src/game/Environment.js`; bentuk jalan, spline, elevasi, air, gameplay, dan penempatan objek tidak diubah. Detail vegetasi, bangunan, sungai, jembatan, dan pencahayaan lanjutan memerlukan validasi visual serta aset yang sesuai.

## Aset yang tersedia di proyek

Daftar berikut berasal dari berkas di `public/models/` dan registrasi aktual di `src/game/AssetLoader.js`. Ketersediaan berkas tidak menjamin aset tersebut sudah ditempatkan pada level.

| Aset terdaftar dan tersedia | Kegunaan yang sesuai |
| --- | --- |
| `palm-detailed.glb` (`palm-tree`) | Palem wilayah pesisir dan tropis |
| `banana-plant-with-a-bunch-of-bananas.glb` (`banana-plant`) | Vegetasi pekarangan tropis |
| `RUMPUT_realistics_grass_06.glb` (`realistic-grass`), `RUMPUT_tropical_plant.glb` (`tropical-plant`), `PAKIS_fern_grass_01.glb` (`fern`) | Penutup tanah dan tumbuhan bawah |
| `tree_low_poly_lowpoly.glb` (`tree-lowpoly`), `hutan-pinus/ponderosa_stand_sketchfab.glb` (`ponderosa_stand_sketchfab`) | Pohon; model ponderosa berkarakter pinus dan perlu dipakai hemat untuk wilayah tropis |
| `rice_plant.glb` (`rice-plant`) | Padi; penempatan saat ini dibatasi ke Level 3 |
| `RUMAH KAYU PANGGUNG_rusty_roof_wooden_house_1_3d_model_free.glb` (`wooden-stilt-house`), `RUMAH TUA.glb` (`old-house`), `RUMAH_BATU_rumah8ws.glb` (`stone-house`), `RUMAH BATU 2house_x_xiv.glb` (`stone-house-2`), `Mountain Cabin by Alex Safayan - cspkBmqAq8g.glb` (`mountain-cabin`) | Rumah dan bangunan permukiman |
| `building-a.glb`, `low-detail-building-a.glb`, `RUMAH KOS_the_closed_ems_building_game_ready.glb` | Massa bangunan perkotaan |
| `JEMBATAN.glb` (`bridge`), `JEMBATAN2.glb` (`bridge-2`), `bridge-pillar-wide.glb` | Referensi aset jembatan; dimensi dan kecocokan kontur perlu diperiksa sebelum penempatan |
| `JALAN ASPAL.glb`, `JALAN PEGUNUNGAN.glb`, `JALAN_KOTA_street.glb` | Referensi visual jalan, bukan pengganti geometri jalan aktif |
| `electricity-pole.glb`, `electricity-side.glb`, `light-curved.glb`, `traffic-light-object-hanging.glb`, `RAMBU JALAN.glb` | Fasilitas jalan perkotaan |

Tekstur yang benar-benar tersedia mencakup `public/textures/colormap.png`, `variation-b.png`, serta tekstur model hutan pinus. Tekstur model tersebut terikat pada model sumber dan bukan set material terrain regional yang siap pakai.

## Standar visual lintas level

- Terrain memakai satu mesh kontinu agar tidak menambah banyak draw call. Warna vertex mengatur bioma dan tekstur prosedural netral memberi butiran permukaan.
- Hindari hijau neon/jenuh. Rumput tropis memakai hijau zaitun sedang, tanah memakai cokelat mineral, pantai memakai pasir hangat, dan lereng batu memakai abu-abu hangat.
- Peralihan bioma memakai mask halus yang dipengaruhi elevasi, jarak dari bahu jalan, dan noise multi-skala. Hindari batas lurus berupa petak warna.
- Air tetap mengikuti fungsi `isWaterAt()` dan geometri yang ada. Material tepi air idealnya bergerak dari pasir/lempung basah ke tanah darat secara gradual.
- Target awal terrain: maksimal satu draw call permukaan darat per level, tekstur procedural 256 × 256, tanpa dependensi atau tekstur eksternal baru. Target frame adalah 60 FPS pada perangkat desktop kelas menengah; verifikasi FPS di browser belum dilakukan.
- Kriteria visual: permukaan tidak tampak hijau polos; skala butiran terbaca dari kamera permainan; transisi warna menyatu; terrain, bahu jalan, dan garis pantai tidak menghasilkan celah atau tumpang tindih mencolok.

## Level 1 — Kolaka Utara menuju Kolaka

- **Materi:** Gerak Lurus Beraturan (GLB).
- **Konsep visual:** perjalanan pesisir yang terbuka, melewati By Pass lurus, kawasan perkotaan Kolaka Utara, lalu jalan berkelok menuju Kolaka. Identitasnya mencakup pesisir, pantai, permukiman, perkotaan, dan jalan berkelok.
- **Terrain:** dataran pesisir relatif rendah di sisi laut, pasir dan tanah pantai di tepi air, tanah rumput tropis di luar koridor pantai, serta kontur ringan menuju perkotaan dan ruas berkelok. Pertahankan profil elevasi dan spline jalan yang sekarang.
- **Palet:** biru laut lembut, pasir krem kecokelatan, tanah cokelat hangat, hijau zaitun, dan aspal abu-abu netral.
- **Aset tersedia:** palem, tanaman pisang, rumput tropis, rumah panggung, rumah tua, dan rumah batu tersedia serta beberapa sudah dipakai dalam penempatan Level 1. Tidak ada aset pantai khusus yang terdaftar.
- **Vegetasi:** palem pesisir, pisang di pekarangan, rumput dan tumbuhan bawah tropis; beri sela pandang ke laut.
- **Landmark:** garis pantai dan transisi menuju permukiman/perkotaan Kolaka. Jembatan besar tidak ditetapkan sebagai landmark tanpa verifikasi bentang dan kontur.
- **Atmosfer/pencahayaan:** siang tropis hangat, langit cerah berkabut tipis di kejauhan; hindari fog yang menghapus garis pantai.
- **Fisika dan lingkungan:** ruas lurus memberi ruang mengamati GLB dan hubungan jarak-waktu; tikungan menuju Kolaka menjadi transisi suasana setelah demonstrasi gerak lurus.
- **Three.js:** satu `BufferGeometry` terrain dengan vertex color bioma, tekstur procedural tiling, roughness tinggi; air memakai sistem yang ada. UV tekstur terrain Stage 2.4 berskala sekitar 7 unit dunia per tile.
- **Penerimaan:** tekstur dan rumput/pasir terbaca dari kamera permainan, batas pantai berbaur, jalan tetap sama. Tampilan aktual perlu diperiksa di browser.

## Level 2 — Kolaka menuju Kolaka Timur

- **Materi:** kelajuan, kecepatan, jarak, dan waktu.
- **Konsep visual:** jalan pegunungan melalui perkampungan warga, dengan perbukitan, lereng, vegetasi pegunungan, serta permukiman.
- **Terrain:** punggung bukit dan lereng berlapis dengan kontur lembut. Hindari perubahan mendadak yang mengganggu keterbacaan jalan.
- **Palet:** hijau hutan zaitun, tanah cokelat tua, batu abu-abu hangat, atap dan kayu dalam warna kusam.
- **Aset tersedia:** pohon low-poly, model ponderosa, pakis, rumput realistis, kabin gunung, rumah tua, serta rumah batu tersedia. Ponderosa berpenampilan pinus dan bukan representasi botani lokal yang akurat.
- **Vegetasi:** vegetasi lereng tropis berlapis; gunakan pakis dan semak rendah di bahu, pohon berjeda agar jarak pandang tikungan terjaga.
- **Landmark:** punggung bukit, tanjakan/puncak, dan kampung lereng; tidak ada landmark geografis khusus yang dimodelkan sebagai aset.
- **Atmosfer/pencahayaan:** cahaya siang menyebar dengan kabut jarak jauh ringan; jaga kontras jalan dan lereng.
- **Fisika dan lingkungan:** perubahan elevasi dan arah perjalanan memberi konteks untuk membedakan kelajuan (skalar), kecepatan (arah), jarak, dan waktu.
- **Three.js:** gunakan mask batu yang mengikuti elevasi dan lereng, campuran tanah/rumput; pertahankan satu mesh terrain dan tekstur mikro bersama.
- **Penerimaan:** lereng terbaca sebagai bentuk kontinu dan tekstur tidak meregang pada bukit; validasi melalui browser masih diperlukan.

## Level 3 — Kolaka Timur menuju Konawe

- **Materi:** GLBB dipercepat.
- **Konsep visual:** jalan lurus melalui persawahan padi dan perkampungan warga. Identitasnya adalah lahan pertanian dan petak sawah.
- **Terrain:** dataran rendah luas dengan bidang sawah berpetak dan pematang landai. Padi hanya muncul di lintasan ini.
- **Palet:** hijau padi yang lebih muda tetapi terkendali, tanah sawah cokelat gelap, air irigasi biru kehijauan kusam, dan hijau pekarangan.
- **Aset tersedia:** `rice_plant.glb`, rumah tua/batu, pohon, pisang, dan rumput tersedia. Penempatan padi sekarang memang berada dalam cabang Level 3.
- **Vegetasi:** padi hanya di petak sawah Level 3; pohon pekarangan dan rumput di pematang.
- **Landmark:** petak sawah, saluran air kecil, kampung di kejauhan. Aset saluran irigasi khusus belum tersedia.
- **Atmosfer/pencahayaan:** siang cerah dengan pantulan lembut pada air sawah; jaga supaya refleksi tidak menutupi marka jalan.
- **Fisika dan lingkungan:** jalan lurus dan pola petak yang bergerak memberi pembanding visual perubahan kecepatan pada GLBB dipercepat.
- **Three.js:** variasi material dataran dapat memakai soil/grass/wet-soil dari shader atau vertex color yang sama; petak sawah dan airnya memerlukan geometri khusus terpisah pada tahap lanjutan.
- **Penerimaan:** padi tidak muncul di level lain, sawah terbaca sebagai petak, dan permukaan tidak menyerupai hamparan hijau tunggal.

## Level 4 — Konawe menuju Konawe Selatan

- **Materi:** GLBB diperlambat dan pengereman.
- **Konsep visual:** jalan sedikit menantang melewati lembah, aliran sungai, jembatan, dan perkampungan warga.
- **Terrain:** lereng lembah turun menuju koridor sungai; tanah tepian sungai lebih gelap/lembap, batu muncul pada lereng curam. Geometri jembatan harus mengikuti lebar jalan dan kontur aktual.
- **Palet:** hijau lereng, cokelat lembap, batu abu-abu, serta air sungai biru kehijauan yang tidak terlalu jenuh.
- **Aset tersedia:** `JEMBATAN.glb`, `JEMBATAN2.glb`, dan `bridge-pillar-wide.glb` ada di proyek. Kesesuaian dimensi/bentang belum diverifikasi, sehingga pemakaian harus menunggu inspeksi model.
- **Vegetasi:** rumput, pakis, dan pohon tropis pada lereng; sisakan bukaan visual di kedua tepi jembatan.
- **Landmark:** sungai dan jembatan yang terpasang setelah ukuran dek, lebar jalan, tinggi tepian, dan kontur cocok. Jika aset tidak cocok, jangan memaksakannya.
- **Atmosfer/pencahayaan:** lembah dengan cahaya menyebar dan pantulan air terkendali; pastikan titik pengereman tetap jelas.
- **Fisika dan lingkungan:** pendekatan, penurunan ke jembatan, dan keluar lembah membentuk konteks untuk perlambatan serta pengereman.
- **Three.js:** material terrain berbagi tekstur mikro; material tepi sungai perlu transisi wet-soil. Jembatan menjadi mesh aset terpisah hanya setelah validasi ukuran dan posisi.
- **Penerimaan:** sungai memiliki koridor lembah yang masuk akal dan jembatan menyambung mulus tanpa mengubah jalur aktif; belum dapat dipastikan tanpa inspeksi browser/aset.

## Level 5 — Konawe Selatan menuju Kendari

- **Materi:** gabungan GLB dan GLBB sebagai tantangan akhir.
- **Konsep visual:** jalan lurus memasuki Kota Kendari, dengan transisi kawasan menuju perkotaan, bangunan, fasilitas jalan, dan lingkungan kota.
- **Terrain:** dataran pinggiran kota berubah bertahap menjadi permukaan terbangun. Kurangi paparan tanah alami saat kepadatan bangunan dan fasilitas jalan meningkat.
- **Palet:** tanah pinggiran hijau zaitun dan cokelat, lalu abu-abu beton/aspal, warna bangunan kusam, dan aksen marka jalan.
- **Aset tersedia:** bangunan low-detail, gedung kos, lampu jalan, tiang listrik, lampu lalu lintas, tempat sampah, dan pohon tersedia; sebagian dipakai di level ini.
- **Vegetasi:** pohon dan palem berjeda pada pinggiran, lebih sedikit pada koridor kota padat.
- **Landmark:** gerbang masuk perkotaan secara visual, deret bangunan, fasilitas lalu lintas. Landmark Kendari spesifik belum tersedia sebagai aset terverifikasi.
- **Atmosfer/pencahayaan:** siang kota tropis dengan bayangan bangunan yang jelas; kontras marka dan rambu harus tetap tinggi.
- **Fisika dan lingkungan:** transisi dari jalan terbuka untuk GLB ke situasi kota yang menuntut perubahan kecepatan sebagai GLBB dan tantangan akhir.
- **Three.js:** lereng/batuan berkurang seiring `urbanDensity`; material terrain dapat bergeser ke tanah padat/permukaan terbangun lewat vertex mask. Jalan aktif tetap geometri spline.
- **Penerimaan:** transisi pinggiran ke kota terasa berangsur, objek kota tidak menutupi pandangan jalan, dan performa tetap memenuhi target real-time.

## Catatan implementasi Stage 2.4

Terrain saat ini menggunakan grid kontinu 56 × 102, warna vertex, dan CanvasTexture prosedural 256 × 256. Tekstur mikro netral dibuat tileable dan UV-nya memakai sekitar 7 unit dunia per tile. Warna vertex mencampur hijau zaitun, tanah, pasir (Level 1 pesisir), dan batu pada lereng tinggi memakai mask smoothstep dan noise multi-skala. Sistem tidak membuat geometri terrain baru atau mengubah `terrainHeight()` / `isWaterAt()`.

Level 1 menjadi acuan awal material pesisir, tetapi pemeriksaan visual browser belum dilakukan. Transisi tanah-air khusus, texture/normal map eksternal, petak sawah khusus, dan penyesuaian material regional per level masih pekerjaan berikutnya setelah fondasi ini diperiksa secara visual.
