// DUMMY sementara. Ganti isi fungsi ini dengan hasil kerja anggota lain.
// Input : { clump_thickness, uniformity_cell_size, ... } (semua angka 1-10)
// Output: { score, classLabel }  -> classLabel: 2 = benign, 4 = malignant
export function classify(inputs) {
  const values = Object.values(inputs).map(Number);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const score = avg > 5 ? 0.84 : 0.5;
  return { score, classLabel: score >= 0.8 ? 4 : 2 };
}