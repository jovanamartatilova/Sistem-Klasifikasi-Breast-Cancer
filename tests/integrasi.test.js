import test from "node:test";
import assert from "node:assert/strict";

import { classify } from "../src/utils/Mamdani.js";
import { fuzzify, VARIABLES } from "../js/fuzzifikasi.js";
import { evaluateRules, RULES } from "../js/rulebase.js";
import { classifyOutput } from "../src/utils/AgregasiDefuzzifikasi.js";

const keys = Object.keys(VARIABLES);

function makeInput(value) {
    return Object.fromEntries(keys.map((key) => [key, value]));
}

// TEST 1 — Kelengkapan sistem
test("Sistem memiliki 9 atribut dan 27 aturan", () => {
    assert.equal(keys.length, 9);
    assert.equal(RULES.length, 27);
});

// TEST 2 — Validasi input yang benar
test("Input valid menghasilkan skor dan kelas", () => {
    for (const value of [1, 2, 5, 8, 10]) {
    const result = classify(makeInput(value));

    assert.ok(Number.isFinite(result.score));
    assert.ok(result.score >= 0 && result.score <= 1);
    assert.ok([2, 4].includes(result.classLabel));
    }
});

// TEST 3 — Input di luar rentang
test("Input di luar rentang 1-10 ditolak", () => {
    for (const value of [-1, 0, 11, 100]) {
    assert.throws(() => classify(makeInput(value)));
    }
});

// TEST 4 — Input desimal
test("Input desimal ditolak", () => {
    assert.throws(() => classify(makeInput(2.5)));
});

// TEST 5 — Input bukan angka
test("Input string dan null ditolak", () => {
    assert.throws(() => classify(makeInput("abc")));
    assert.throws(() => classify(null));
});

// TEST 6 — Input tidak lengkap
test("Input dengan atribut hilang ditolak", () => {
    const input = makeInput(1);
    delete input.mitosis;

    assert.throws(() => classify(input));
});

// TEST 7 — Fuzzifikasi
test("Derajat keanggotaan berada pada 0-1", () => {
    const result = fuzzify(makeInput(5));

    for (const memberships of Object.values(result)) {
        for (const degree of Object.values(memberships)) {
            assert.ok(Number.isFinite(degree));
            assert.ok(degree >= 0 && degree <= 1);
        }
    }
});

// TEST 8 — Inferensi 27 aturan
test("Semua aturan menghasilkan aktivasi valid", () => {
    const fuzzified = fuzzify(makeInput(5));
    const results = evaluateRules(fuzzified);

    assert.equal(results.length, 27);

    for (const rule of results) {
        assert.ok(rule.activation >= 0 && rule.activation <= 1);
        assert.ok([2, 4].includes(rule.consequent));
    }
});

// TEST 9 — Klasifikasi berdasarkan threshold
test("Threshold klasifikasi adalah 0.8", () => {
    assert.equal(classifyOutput(0.79), 2);
    assert.equal(classifyOutput(0.8), 4);
    assert.equal(classifyOutput(0.9), 4);
});

// TEST 10 — Konsistensi hasil
test("Klasifikasi konsisten dengan skor", () => {
    for (const value of [1, 2, 5, 8, 10]) {
        const result = classify(makeInput(value));

        assert.equal(result.classLabel, classifyOutput(result.score));
    }
});

// TEST 11 — Hasil deterministik
test("Input yang sama menghasilkan output yang sama", () => {
    const input = makeInput(5);

    assert.deepEqual(classify(input), classify(input));
});

test("Input tanpa aturan aktif ditangani dengan jelas", () => {
    const input = {
        clump_thickness: 1,
        uniformity_cell_size: 1,
        uniformity_cell_shape: 1,
        marginal_adhesion: 1,
        single_epi_cell_size: 1,
        bare_nuclei: 10,
        bland_chromatin: 10,
        normal_nucleoli: 1,
        mitosis: 1,
    };

    assert.throws(
        () => classify(input),
        /Tidak ada aturan fuzzy yang aktif/
    );
});