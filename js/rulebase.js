/**
 * Rule base and Mamdani rule evaluation from Table 4 of Gupta et al. (2023).
 * This module stops at rule activation; aggregation and defuzzification belong
 * to the next stage of the pipeline.
 */
export const RULES = [
  { antecedents: [["uniformity_cell_shape", "low"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"], ["mitosis", "low"]], consequent: 2 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"], ["mitosis", "high"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"], ["mitosis", "high"]], consequent: 2 },
  { antecedents: [["clump_thickness", "high"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"], ["mitosis", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "high"], ["bland_chromatin", "low"], ["normal_nucleoli", "low"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "high"], ["bland_chromatin", "low"], ["normal_nucleoli", "low"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "high"], ["bland_chromatin", "high"], ["normal_nucleoli", "low"]], consequent: 4 },
  { antecedents: [["clump_thickness", "high"], ["uniformity_cell_shape", "low"], ["bare_nuclei", "high"], ["normal_nucleoli", "low"]], consequent: 4 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "medium"]], consequent: 4 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "medium"]], consequent: 4 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "medium"]], consequent: 4 },
  { antecedents: [["clump_thickness", "high"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"]], consequent: 2 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "medium"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "medium"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "low"]], consequent: 2 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "high"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "low"]], consequent: 4 },
  { antecedents: [["uniformity_cell_size", "low"], ["uniformity_cell_shape", "high"], ["bare_nuclei", "high"]], consequent: 4 },
  { antecedents: [["uniformity_cell_size", "high"], ["uniformity_cell_shape", "high"]], consequent: 4 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "medium"]], consequent: 2 },
  { antecedents: [["clump_thickness", "low"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "high"]], consequent: 2 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "medium"]], consequent: 4 },
  { antecedents: [["clump_thickness", "medium"], ["uniformity_cell_size", "low"], ["uniformity_cell_shape", "low"], ["normal_nucleoli", "high"]], consequent: 4 },
];

function validateFuzzifiedInputs(fuzzified) {
  if (!fuzzified || typeof fuzzified !== "object" || Array.isArray(fuzzified)) {
    throw new TypeError("Input inferensi harus berupa objek hasil fuzzifikasi");
  }

  for (const { antecedents } of RULES) {
    for (const [variable, set] of antecedents) {
      const degree = fuzzified[variable]?.[set];
      if (typeof degree !== "number" || !Number.isFinite(degree) || degree < 0 || degree > 1) {
        throw new TypeError(`Derajat keanggotaan ${variable}.${set} harus berupa angka 0-1`);
      }
    }
  }
}

/**
 * Evaluate every rule with Mamdani min for its AND antecedents.
 * Input is the nested object returned by fuzzify(); each result contains the
 * rule number, activation strength, and class consequent (2 or 4).
 */
export function evaluateRules(fuzzified) {
  validateFuzzifiedInputs(fuzzified);

  return RULES.map(({ antecedents, consequent }, index) => ({
    ruleNumber: index + 1,
    activation: Math.min(...antecedents.map(([variable, set]) => fuzzified[variable][set])),
    consequent,
  }));
}
