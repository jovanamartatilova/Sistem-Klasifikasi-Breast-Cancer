
import { fuzzify, VARIABLES } from "../../js/fuzzifikasi.js";
import { evaluateRules } from "../../js/rulebase.js";
import { calculateFuzzyOutput } from "./AgregasiDefuzzifikasi.js";

/**
 * Integrasi sistem klasifikasi Breast Cancer
 * menggunakan Fuzzy Mamdani.
 *
 * Input: 9 atribut numerik (1–10)
 * Output: { score, classLabel }
 */
export function classify(inputs) {
  if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
    throw new TypeError("Input harus berupa objek.");
  }

  // 1. Validasi 9 atribut
  for (const key of Object.keys(VARIABLES)) {
    const value = inputs[key];

    if (!Number.isInteger(value) || value < 1 || value > 10) {
      throw new Error(
        `${key} harus berupa bilangan bulat antara 1–10.`
      );
    }
  }

  // 2. Fuzzifikasi
  const fuzzified = fuzzify(inputs);

  // 3. Inferensi berdasarkan 27 aturan
  const ruleResults = evaluateRules(fuzzified);

  // 4. Agregasi dan defuzzifikasi
  const result = calculateFuzzyOutput(ruleResults);

  // 5. Hasil akhir
  return result;
}
