import test from "node:test";
import assert from "node:assert/strict";

import { classify } from "../src/utils/Mamdani.js";
import { fuzzify, VARIABLES } from "../js/fuzzifikasi.js";
import { evaluateRules, RULES } from "../js/rulebase.js";

const keys = Object.keys(VARIABLES);

function makeInput(values) {
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]));
}

// Random generator dengan seed tetap agar reproducible
function createRandom(seed = 2026) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test("Diagnostic: rule coverage dan edge cases", () => {
  const random = createRandom();

  const samples = [];

  // 10 kombinasi input seragam
  for (let n = 1; n <= 10; n++) {
    samples.push(Array(9).fill(n));
  }

  // 512 kombinasi nilai minimum dan maksimum
  for (let mask = 0; mask < 512; mask++) {
    samples.push(keys.map((_, i) => (mask & (1 << i) ? 10 : 1)));
  }

  // 1000 kombinasi acak yang reproducible
  for (let i = 0; i < 1000; i++) {
    samples.push(keys.map(() => Math.floor(random() * 10) + 1));
  }

  const activatedRules = new Set();
  const failures = [];
  const classes = { 2: 0, 4: 0 };

  let noActiveRules = 0;
  let inconsistent = 0;
  let successful = 0;

  for (const values of samples) {
    const input = makeInput(values);

    try {
      const memberships = fuzzify(input);
      const rules = evaluateRules(memberships);

      assert.equal(rules.length, 27);

      const active = rules.filter((rule) => rule.activation > 0);

      if (active.length === 0) {
        noActiveRules++;
      }

      for (const rule of active) {
        activatedRules.add(rule.ruleNumber);
      }

      const result = classify(input);

      if (
        !Number.isFinite(result.score) ||
        result.score < 0 ||
        result.score > 1 ||
        result.classLabel !== (result.score >= 0.8 ? 4 : 2)
      ) {
        inconsistent++;
      }

      classes[result.classLabel]++;
      successful++;
    } catch (error) {
      failures.push({
        input: values,
        message: error.message,
      });
    }
  }

  const neverActivated = RULES.map((_, i) => i + 1).filter(
    (n) => !activatedRules.has(n),
  );

  console.log("\n=== LAPORAN DIAGNOSTIK ===");
  console.log("Total sampel:", samples.length);
  console.log("Berhasil:", successful);
  console.log("Gagal:", failures.length);
  console.log("Benign:", classes[2]);
  console.log("Malignant:", classes[4]);
  console.log("Tanpa aturan aktif:", noActiveRules);
  console.log("Aturan pernah aktif:", `${activatedRules.size}/${RULES.length}`);
  console.log("Aturan belum teraktivasi:", neverActivated);
  console.log("Output inkonsisten:", inconsistent);
  console.log("Contoh kegagalan:", failures.slice(0, 5));

  // Kegagalan benar-benar dicatat, tidak disembunyikan
  assert.equal(inconsistent, 0);

  assert.equal(
    failures.length,
    noActiveRules,
    "Setiap kegagalan harus berasal dari kondisi tanpa aturan aktif",
  );

  for (const failure of failures) {
    assert.match(failure.message, /Tidak ada aturan fuzzy yang aktif/);
  }

  assert.equal(successful + failures.length, samples.length);

  assert.equal(activatedRules.size, RULES.length);
});
