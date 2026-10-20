
/**
 * AGREGASI DAN DEFUZZIFIKASI FUZZY MAMDANI
 *
 * Input:
 * Hasil evaluateRules() dari rulebase.js
 *
 * Output:
 * { score, classLabel }
 */

import { OUTPUT, trimf } from "../../js/fuzzifikasi.js";

// Domain output yang digunakan dalam implementasi
export const OUTPUT_MIN = 0;
export const OUTPUT_MAX = 1;

// Threshold klasifikasi dari jurnal
export const CLASSIFICATION_THRESHOLD = 0.8;


// ==================================================
// 1. AGREGASI ATURAN FUZZY
// ==================================================

/**
 * Menggabungkan seluruh aturan berdasarkan consequent.
 *
 * Consequent 2 = Benign
 * Consequent 4 = Malignant
 *
 * Operator agregasi: MAX
 */

export function aggregateRules(ruleResults) {

  if (!Array.isArray(ruleResults)) {
    throw new TypeError(
      "Hasil inferensi harus berupa array."
    );
  }

  const strengths = {
    2: 0,
    4: 0
  };

  for (const rule of ruleResults) {

    const { activation, consequent } = rule ?? {};

    if (consequent !== 2 && consequent !== 4) {
      throw new Error(
        "Consequent aturan harus 2 atau 4."
      );
    }

    if (
      typeof activation !== "number" ||
      !Number.isFinite(activation) ||
      activation < 0 ||
      activation > 1
    ) {
      throw new Error(
        "Nilai aktivasi harus berada pada rentang 0-1."
      );
    }

    strengths[consequent] = Math.max(
      strengths[consequent],
      activation
    );
  }

  return strengths;
}


// ==================================================
// 2. FUNGSI KEANGGOTAAN HASIL AGREGASI
// ==================================================

/**
 * Menggabungkan keluaran fuzzy dari setiap kelas.
 *
 * Implikasi Mamdani:
 * MIN(alpha, membership output)
 *
 * Agregasi keseluruhan:
 * MAX(benign, malignant)
 */

export function aggregatedMembership(z, strengths) {

  if (!Number.isFinite(z)) {
    throw new TypeError(
      "Nilai z harus berupa angka valid."
    );
  }

  if (
    !strengths ||
    ![2, 4].every(
      (c) =>
        Number.isFinite(strengths[c]) &&
        strengths[c] >= 0 &&
        strengths[c] <= 1
    )
  ) {
    throw new Error(
      "Nilai agregasi kelas harus berada pada 0-1."
    );
  }

  if (z < OUTPUT_MIN || z > OUTPUT_MAX) {
    return 0;
  }

  // Fungsi keanggotaan output sesuai Tabel 3 jurnal
  const membershipBenign = trimf(
    z,
    ...OUTPUT.class_2
  );

  const membershipMalignant = trimf(
    z,
    ...OUTPUT.class_4
  );

  // Implikasi MIN
  const benign = Math.min(
    strengths[2],
    membershipBenign
  );

  const malignant = Math.min(
    strengths[4],
    membershipMalignant
  );

  // Agregasi MAX
  return Math.max(benign, malignant);
}


// ==================================================
// 3. DEFUZZIFIKASI METODE CENTROID
// ==================================================

/**
 * Rumus:
 *
 * z* = integral(z * mu(z)) / integral(mu(z))
 *
 * Perhitungan menggunakan integrasi numerik
 * metode trapesium.
 */

export function defuzzifyCentroid(
  strengths,
  intervals = 10000
) {

  if (
    !Number.isInteger(intervals) ||
    intervals < 2
  ) {
    throw new Error(
      "Jumlah interval harus bilangan bulat >= 2."
    );
  }

  const step =
    (OUTPUT_MAX - OUTPUT_MIN) / intervals;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= intervals; i++) {

    const z = OUTPUT_MIN + i * step;

    const membership = aggregatedMembership(
      z,
      strengths
    );

    // Bobot metode integrasi trapesium
    const weight =
      (i === 0 || i === intervals) ? 0.5 : 1;

    numerator += weight * z * membership;
    denominator += weight * membership;
  }

  // Tidak ada aturan aktif
  if (denominator <= 0) {
    throw new Error(
      "Tidak ada aturan fuzzy yang aktif. " +
      "Centroid tidak dapat dihitung."
    );
  }

  const score =
    (numerator * step) / (denominator * step);

  return score;
}


// ==================================================
// 4. PEMETAAN HASIL KLASIFIKASI
// ==================================================

/**
 * Threshold jurnal = 0.8
 *
 * score < 0.8  -> Benign (2)
 * score >= 0.8 -> Malignant (4)
 */

export function classifyOutput(score) {

  if (
    !Number.isFinite(score) ||
    score < OUTPUT_MIN ||
    score > OUTPUT_MAX
  ) {
    throw new Error(
      "Skor harus berada pada rentang 0-1."
    );
  }

  return score >= CLASSIFICATION_THRESHOLD
    ? 4
    : 2;
}



export function calculateFuzzyOutput(
  ruleResults,
  intervals = 10000
) {

  const strengths = aggregateRules(ruleResults);

  const score = defuzzifyCentroid(
    strengths,
    intervals
  );

  const classLabel = classifyOutput(score);

  return {
    score,
    classLabel
  };
}

export default calculateFuzzyOutput;
