// Jalankan: node fuzzifikasi.test.js   (Node 18+)
import assert from "node:assert/strict";
import { fuzzify, fuzzifyVariable, trimf, OUTPUT, VARIABLES } from "./fuzzifikasi.js";

const near = (a, b, tol = 1e-3) => Math.abs(a - b) < tol;

const benign = {
  clump_thickness: 2, uniformity_cell_size: 1, uniformity_cell_shape: 2,
  marginal_adhesion: 1, single_epi_cell_size: 3, bare_nuclei: 1,
  bland_chromatin: 2, normal_nucleoli: 1, mitosis: 1,
}; // Gambar 3a jurnal (low risk)

const malignant = {
  clump_thickness: 8, uniformity_cell_size: 10, uniformity_cell_shape: 10,
  marginal_adhesion: 8, single_epi_cell_size: 7, bare_nuclei: 10,
  bland_chromatin: 9, normal_nucleoli: 7, mitosis: 1,
}; // Gambar 3b jurnal (Actual Output = 4)

const overlap = {
  clump_thickness: 5, uniformity_cell_size: 3, uniformity_cell_shape: 3,
  marginal_adhesion: 2, single_epi_cell_size: 3, bare_nuclei: 2,
  bland_chromatin: 2, normal_nucleoli: 3, mitosis: 2,
};

for (const [title, s] of [["Benign", benign], ["Malignant", malignant], ["Overlap", overlap]]) {
  console.log(`\n=== ${title} ===`);
  const r = fuzzify(s);
  for (const [name, d] of Object.entries(r)) {
    console.log(`${VARIABLES[name].label.padEnd(34)} x=${String(s[name]).padEnd(3)} ->`, JSON.stringify(d));
  }
}

// Perhitungan manual
assert.deepEqual(fuzzifyVariable("clump_thickness", 2), { low: 1, medium: 0, high: 0 });
let r = fuzzifyVariable("clump_thickness", 5);
assert.ok(near(r.medium, 0.901) && r.high === 0 && r.low === 0);
r = fuzzifyVariable("clump_thickness", 3);
assert.ok(near(r.low, 0.1028) && r.medium === 1);
assert.deepEqual(fuzzifyVariable("bare_nuclei", 1), { low: 1, high: 0 });
assert.deepEqual(fuzzifyVariable("bare_nuclei", 10), { low: 0, high: 1 });
r = fuzzifyVariable("uniformity_cell_size", 3);
assert.ok(near(r.low, 0.1309) && near(r.high, 0.7218));
assert.equal(trimf(0.5, ...OUTPUT.class_2), 1);
assert.equal(trimf(1.0, ...OUTPUT.class_4), 1);

// Validasi
assert.throws(() => fuzzifyVariable("mitosis", 0));
assert.throws(() => fuzzifyVariable("mitosis", 11));
assert.throws(() => fuzzifyVariable("mitosis", NaN));
assert.throws(() => fuzzifyVariable("xyz", 5));
assert.throws(() => fuzzify({ mitosis: 1 }));

console.log("\nSemua pengujian lulus.");
