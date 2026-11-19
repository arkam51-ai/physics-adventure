export const LEVELS = [
  {
    id: 'glb',
    name: 'Kolaka Utara → Kolaka',
    materialTitle: 'GERAK LURUS BERATURAN (GLB)',
    route: 'Jalur Lurus Pesisir By Pass',
    subtitle: 'Dasar Gerak dan Kecepatan',
    description: 'Memahami hubungan jarak, waktu, dan kecepatan melalui perjalanan Honda Jazz dengan kecepatan tetap.',
    accent: '#41c995',
    maxSpeed: 22,
    acceleration: 3.2,
    braking: 6,
    distance: 300,
    checkpointDistance: 270,
    checkpointTime: 60
  },
  {
    id: 'glbb',
    name: 'Kolaka → Kolaka Timur',
    materialTitle: 'GERAK LURUS BERUBAH BERATURAN (GLBB)',
    route: 'Jalur Alam Perbukitan',
    subtitle: 'Hubungan Besaran dalam GLBB',
    description: 'Mengenali hubungan kecepatan, waktu, perpindahan, dan percepatan melalui perubahan gerak kendaraan.',
    accent: '#ffac48',
    maxSpeed: 27,
    acceleration: 4.4,
    braking: 7.5,
    distance: 300,
    checkpointDistance: 270,
    checkpointTime: 55
  },
  {
    id: 'glbb-accelerated',
    name: 'Kolaka Timur → Konawe',
    materialTitle: 'GERAK DIPERCEPAT',
    route: 'Jalur Lurus Permukiman & Pertanian',
    subtitle: 'Percepatan dan Perubahan Kecepatan',
    description: 'Menganalisis perubahan kecepatan dan percepatan Honda Jazz ketika bergerak semakin cepat.',
    accent: '#ef7655',
    maxSpeed: 29,
    acceleration: 4.8,
    braking: 7.5,
    distance: 300,
    checkpointDistance: 270,
    checkpointTime: 50
  },
  {
    id: 'glbb-braking',
    name: 'Konawe → Konawe Selatan',
    materialTitle: 'GERAK DIPERLAMBAT',
    route: 'Jalur Menantang',
    subtitle: 'Perlambatan dan Pengaruh Gaya',
    description: 'Menganalisis perlambatan kendaraan, proses pengereman, dan pengaruh gaya terhadap perubahan kecepatan.',
    accent: '#49a6c8',
    maxSpeed: 29,
    acceleration: 4.8,
    braking: 8.5,
    distance: 300,
    checkpointDistance: 270,
    checkpointTime: 45
  },
  {
    id: 'grand-prix',
    name: 'Konawe Selatan → Kendari',
    materialTitle: 'GRAND PRIX FISIKA',
    route: 'Jalur Permukiman & Alam',
    subtitle: 'Analisis Grafik dan Kombinasi Gerak',
    description: 'Mengintegrasikan konsep gerak melalui interpretasi grafik dan analisis berbagai situasi perjalanan Honda Jazz.',
    accent: '#8a79ee',
    maxSpeed: 31,
    acceleration: 5.2,
    braking: 8,
    distance: 300,
    checkpointDistance: 270,
    checkpointTime: 40
  }
];

export class LevelManager {
  getLevels() {
    return LEVELS;
  }

  getLevel(id) {
    return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
  }
}
