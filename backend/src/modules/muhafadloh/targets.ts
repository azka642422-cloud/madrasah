// Target Muhafadloh 8 pelaksanaan per tahun sesuai sumber yang sudah diaudit.
// Tidak merepresentasikan target hafalan Al-Qur'an/juz.
export const MUHAFADLOH_TARGETS:Record<number,readonly number[]>={
 1:[7,7,7,7,7,6,6,6],
 2:[7,7,7,7,7,7,7,6],
 3:[18,16,16,16,16,16,16,16],
 4:[16,16,16,16,15,15,15,15],
 5:[11,11,10,10,10,10,10,10],
 6:[1,1,1,1,1,1,1,1],
} as const;

// Catatan sumber: angka tahunan kelas 5 pernah tercantum 80, sedangkan jumlah delapan target di atas = 82.
// Sistem tidak mengoreksi atau mengarang angka; discrepancy harus tetap ditandai untuk verifikasi sumber.
export const MUHAFADLOH_SOURCE_NOTES={5:'Target tahunan sumber tercantum 80; jumlah M1-M8 = 82. Perlu verifikasi sumber resmi.'} as const;
