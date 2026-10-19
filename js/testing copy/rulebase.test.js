import assert from "node:assert/strict";
import { fuzzify, VARIABLES } from "../fuzzifikasi.js";
import { evaluateRules, RULES } from "../rulebase.js";

const noActivation = {
  clump_thickness: { low: 0, medium: 0, high: 0 },
  uniformity_cell_size: { low: 0, high: 0 },
  uniformity_cell_shape: { low: 0, high: 0 },
  bare_nuclei: { low: 0, high: 0 },
  bland_chromatin: { low: 0, high: 0 },
  normal_nucleoli: { low: 0, medium: 0, high: 0 },
  mitosis: { low: 0, high: 0 },
};

assert.equal(RULES.length, 27);
const zeroResults = evaluateRules(noActivation);
assert.equal(zeroResults.length, 27);
assert.ok(zeroResults.every(({ activation }) => activation === 0));

const oneActiveRule = {
  ...noActivation,
  clump_thickness: { ...noActivation.clump_thickness, low: 0.2 },
  uniformity_cell_size: { ...noActivation.uniformity_cell_size, high: 0.7 },
  uniformity_cell_shape: { ...noActivation.uniformity_cell_shape, low: 0.8 },
  normal_nucleoli: { ...noActivation.normal_nucleoli, medium: 0.6 },
};
const results = evaluateRules(oneActiveRule);
assert.deepEqual(results[8], { ruleNumber: 9, activation: 0.2, consequent: 4 });
assert.equal(results[8].activation, Math.min(0.2, 0.7, 0.8, 0.6));

const class2Sample = {
  clump_thickness: { low: 1, medium: 0, high: 0 },
  uniformity_cell_shape: { low: 1, high: 0 },
  bare_nuclei: { low: 1, high: 0 },
  normal_nucleoli: { low: 1, medium: 0, high: 0 },
  mitosis: { low: 1, high: 0 },
  uniformity_cell_size: { low: 1, high: 0 },
  bland_chromatin: { low: 1, high: 0 },
};
assert.equal(evaluateRules(class2Sample)[0].activation, 1);
assert.equal(evaluateRules(class2Sample)[0].consequent, 2);

const class4Sample = {
  ...noActivation,
  uniformity_cell_size: { ...noActivation.uniformity_cell_size, high: 1 },
  uniformity_cell_shape: { ...noActivation.uniformity_cell_shape, high: 1 },
};
assert.deepEqual(evaluateRules(class4Sample)[22], {
  ruleNumber: 23,
  activation: 1,
  consequent: 4,
});

const benignInput = Object.fromEntries(Object.keys(VARIABLES).map((name) => [name, 1]));
const malignantInput = Object.fromEntries(Object.keys(VARIABLES).map((name) => [name, 10]));
assert.equal(evaluateRules(fuzzify(benignInput))[0].activation, 0.9491);
assert.equal(evaluateRules(fuzzify(malignantInput))[22].activation, 0.9735);

assert.throws(() => evaluateRules(null), /objek hasil fuzzifikasi/);
assert.throws(() => evaluateRules({ ...noActivation, uniformity_cell_size: { low: 1 } }), /uniformity_cell_size.high/);
assert.throws(() => evaluateRules({ ...noActivation, uniformity_cell_shape: { low: 1.2, high: 0 } }), /angka 0-1/);

console.log("Semua pengujian rule base lulus.");
