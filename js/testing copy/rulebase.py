"""Python counterpart of ../rulebase.js; evaluates rule activations only."""

RULES = [
    ([("uniformity_cell_shape", "low"), ("bare_nuclei", "low"), ("normal_nucleoli", "low"), ("mitosis", "low")], 2),
    ([("clump_thickness", "low"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "low"), ("normal_nucleoli", "low"), ("mitosis", "high")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "low"), ("normal_nucleoli", "low"), ("mitosis", "high")], 2),
    ([("clump_thickness", "high"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "low"), ("normal_nucleoli", "low"), ("mitosis", "high")], 4),
    ([("clump_thickness", "low"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "high"), ("bland_chromatin", "low"), ("normal_nucleoli", "low")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "high"), ("bland_chromatin", "low"), ("normal_nucleoli", "low")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "high"), ("bland_chromatin", "high"), ("normal_nucleoli", "low")], 4),
    ([("clump_thickness", "high"), ("uniformity_cell_shape", "low"), ("bare_nuclei", "high"), ("normal_nucleoli", "low")], 4),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "medium")], 4),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "medium")], 4),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "high")], 4),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "high")], 4),
    ([("clump_thickness", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "medium")], 4),
    ([("clump_thickness", "high"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "high")], 4),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "low")], 2),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "medium")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "medium")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "low")], 2),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "high")], 4),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low"), ("normal_nucleoli", "high")], 4),
    ([("clump_thickness", "high"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "low")], 4),
    ([("uniformity_cell_size", "low"), ("uniformity_cell_shape", "high"), ("bare_nuclei", "high")], 4),
    ([("uniformity_cell_size", "high"), ("uniformity_cell_shape", "high")], 4),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "medium")], 2),
    ([("clump_thickness", "low"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "high")], 2),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "medium")], 4),
    ([("clump_thickness", "medium"), ("uniformity_cell_size", "low"), ("uniformity_cell_shape", "low"), ("normal_nucleoli", "high")], 4),
]


def evaluate_rules(fuzzified):
    """Return all 27 rule activations using min for each AND antecedent."""
    if not isinstance(fuzzified, dict):
        raise TypeError("Input inferensi harus berupa dict hasil fuzzifikasi")

    results = []
    for index, (antecedents, consequent) in enumerate(RULES, start=1):
        degrees = []
        for variable, fuzzy_set in antecedents:
            try:
                degree = fuzzified[variable][fuzzy_set]
            except (KeyError, TypeError):
                raise ValueError(
                    f"Derajat keanggotaan {variable}.{fuzzy_set} tidak tersedia"
                ) from None
            if (
                isinstance(degree, bool)
                or not isinstance(degree, (int, float))
                or not 0 <= degree <= 1
            ):
                raise ValueError(
                    f"Derajat keanggotaan {variable}.{fuzzy_set} harus berupa angka 0-1"
                )
            degrees.append(degree)
        results.append({
            "ruleNumber": index,
            "activation": min(degrees),
            "consequent": consequent,
        })
    return results
