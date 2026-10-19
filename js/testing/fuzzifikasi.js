/**
 * Fuzzifikasi FRBS Deteksi Kanker Payudara (ES Module)
 * Replikasi: Gupta et al. (2023), IET Image Processing 17(7), 2083-2096.
 *
 * Parameter dari Tabel 3 jurnal:
 *   4 angka [a, b, c, d] -> trapesium (seperti trapmf MATLAB)
 *   3 angka [p, q, r]    -> segitiga  (seperti trimf MATLAB)
 * Domain input WBCD: 1-10.
 *
 * Pemakaian di browser:
 *   <script type="module">
 *     import { fuzzify } from "./fuzzifikasi.js";
 *     console.log(fuzzify({ clump_thickness: 2, ... }));
 *   </script>
 */

// ---------------------------------------------------------------------------
// 1. Fungsi keanggotaan
// ---------------------------------------------------------------------------
export function trapmf(x, a, b, c, d) {
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a); // sisi naik
  return (d - x) / (d - c); // sisi turun
}

export function trimf(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function mf(x, params) {
  if (params.length === 4) return trapmf(x, ...params);
  if (params.length === 3) return trimf(x, ...params);
  throw new Error("Parameter harus 3 (segitiga) atau 4 (trapesium) angka");
}

// ---------------------------------------------------------------------------
// 2. Definisi variabel (Tabel 2 & 3 jurnal)
// ---------------------------------------------------------------------------
export const VARIABLES = {
  clump_thickness: {
    label: "A1 - Clump Thickness",
    sets: {
      low: [-3.75, -0.417, 2.04, 3.11],
      medium: [2.09, 2.96, 4.9, 5.91],
      high: [5.023, 6.1, 10.9, 14.3],
    },
  },
  uniformity_cell_size: {
    label: "A2 - Uniformity of Cell Size",
    sets: {
      low: [-3.75, -0.417, 2.09, 3.137],
      high: [2.04, 3.37, 9.91, 13.3],
    },
  },
  uniformity_cell_shape: {
    label: "A3 - Uniformity of Cell Shape",
    sets: {
      low: [-3.75, -0.417, 1.47, 3.06],
      high: [1.53, 3.78, 10.4, 13.7],
    },
  },
  marginal_adhesion: {
    label: "A4 - Marginal Adhesion",
    sets: {
      low: [-3.75, -0.417, 0.903, 2.137],
      high: [0.995, 2.09, 10.25, 13.1],
    },
  },
  single_epi_cell_size: {
    label: "A5 - Single Epithelial Cell Size",
    sets: {
      low: [-3.75, -0.417, 1.89, 3.08],
      high: [1.97, 3.125, 10.4, 13.8],
    },
  },
  bare_nuclei: {
    label: "A6 - Bare Nuclei",
    sets: {
      low: [-3.75, -0.417, 1.04, 2.045],
      high: [1.03, 2.153, 10.4, 13.8],
    },
  },
  bland_chromatin: {
    label: "A7 - Bland Chromatin",
    sets: {
      low: [-3.75, -0.417, 0.903, 2.06],
      high: [1.01, 2.137, 10.4, 13.8],
    },
  },
  normal_nucleoli: {
    label: "A8 - Normal Nucleoli",
    sets: {
      low: [-3.75, -0.417, 1.97, 3.063],
      medium: [1.94, 2.97, 4.04, 5.023],
      high: [4.07, 5.008, 10.1, 13.4],
    },
  },
  mitosis: {
    label: "A9 - Mitosis",
    sets: {
      low: [-3.75, -0.417, 0.9491, 1.95],
      high: [1.01, 1.998, 10.4, 13.8],
    },
  },
};

// Output (Tabel 3): 3 angka -> segitiga
export const OUTPUT = {
  class_2: [0.00231, 0.5, 0.9992], // benign
  class_4: [0.5054, 1.0, 1.42], // malignant
};

export const INPUT_MIN = 1;
export const INPUT_MAX = 10;

const round4 = (v) => Math.round(v * 1e4) / 1e4;

// ---------------------------------------------------------------------------
// 3. Fuzzifikasi
// ---------------------------------------------------------------------------
/** Derajat keanggotaan satu input -> { low: 1, high: 0, ... } */
export function fuzzifyVariable(name, x) {
  const variable = VARIABLES[name];
  if (!variable) throw new Error(`Variabel tidak dikenal: ${name}`);
  if (typeof x !== "number" || Number.isNaN(x)) {
    throw new Error(`${name}: nilai harus berupa angka`);
  }
  if (x < INPUT_MIN || x > INPUT_MAX) {
    throw new Error(`${name}=${x} di luar rentang ${INPUT_MIN}-${INPUT_MAX}`);
  }
  const out = {};
  for (const [setName, params] of Object.entries(variable.sets)) {
    out[setName] = round4(mf(x, params));
  }
  return out;
}

/** Fuzzifikasi semua 9 input. sample = { clump_thickness: 2, ... } */
export function fuzzify(sample) {
  const missing = Object.keys(VARIABLES).filter((k) => !(k in sample));
  if (missing.length) throw new Error(`Input kurang: ${missing.join(", ")}`);
  const result = {};
  for (const name of Object.keys(VARIABLES)) {
    result[name] = fuzzifyVariable(name, sample[name]);
  }
  return result;
}

/**
 * Titik-titik kurva untuk menggambar grafik (mis. Chart.js / canvas).
 * Return: { low: [{x, y}, ...], high: [...] }
 */
export function curvePoints(name, steps = 200) {
  const variable = VARIABLES[name];
  if (!variable) throw new Error(`Variabel tidak dikenal: ${name}`);
  const out = {};
  for (const [setName, params] of Object.entries(variable.sets)) {
    out[setName] = [];
    for (let i = 0; i <= steps; i++) {
      const x = INPUT_MIN + ((INPUT_MAX - INPUT_MIN) * i) / steps;
      out[setName].push({ x, y: mf(x, params) });
    }
  }
  return out;
}
