export const LEVELS = [
  {
    id: 'glb',
    name: 'Lembah GLB',
    subtitle: 'Gerak Lurus Beraturan',
    description: 'Jaga kecepatan konstan, kumpulkan koin, dan temukan hubungan jarak dengan waktu.',
    accent: '#41c995',
    maxSpeed: 22,
    acceleration: 3.2,
    braking: 6,
    distance: 300
  },
  {
    id: 'glbb',
    name: 'Bukit GLBB',
    subtitle: 'Gerak Lurus Berubah Beraturan',
    description: 'Atur gas dan rem di jalur berbukit untuk memahami percepatan dan perlambatan.',
    accent: '#ffac48',
    maxSpeed: 27,
    acceleration: 4.4,
    braking: 7.5,
    distance: 300
  },
  {
    id: 'grand-prix',
    name: 'Grand Prix Fisika',
    subtitle: 'Tantangan Gerak Gabungan',
    description: 'Tuntaskan soal gerak dan grafik untuk membuka jalan menuju garis finis.',
    accent: '#8a79ee',
    maxSpeed: 31,
    acceleration: 5.2,
    braking: 8,
    distance: 300
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
