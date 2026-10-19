import unittest

from fuzzifikasi import VARIABLES, fuzzify
from rulebase import RULES, evaluate_rules


def zero_fuzzified():
    return {
        "clump_thickness": {"low": 0, "medium": 0, "high": 0},
        "uniformity_cell_size": {"low": 0, "high": 0},
        "uniformity_cell_shape": {"low": 0, "high": 0},
        "bare_nuclei": {"low": 0, "high": 0},
        "bland_chromatin": {"low": 0, "high": 0},
        "normal_nucleoli": {"low": 0, "medium": 0, "high": 0},
        "mitosis": {"low": 0, "high": 0},
    }


class RuleBaseTests(unittest.TestCase):
    def test_contains_all_27_paper_rules(self):
        self.assertEqual(len(RULES), 27)
        self.assertEqual(len(evaluate_rules(zero_fuzzified())), 27)

    def test_zero_memberships_give_zero_activation(self):
        self.assertTrue(all(
            result["activation"] == 0
            for result in evaluate_rules(zero_fuzzified())
        ))

    def test_and_uses_minimum_membership(self):
        fuzzified = {
            **zero_fuzzified(),
        }
        fuzzified["clump_thickness"]["low"] = 0.2
        fuzzified["uniformity_cell_size"]["high"] = 0.7
        fuzzified["uniformity_cell_shape"]["low"] = 0.8
        fuzzified["normal_nucleoli"]["medium"] = 0.6
        self.assertEqual(
            evaluate_rules(fuzzified)[8],
            {"ruleNumber": 9, "activation": 0.2, "consequent": 4},
        )

    def test_class_2_rule_activation(self):
        fuzzified = zero_fuzzified()
        fuzzified["uniformity_cell_shape"]["low"] = 1
        fuzzified["bare_nuclei"]["low"] = 1
        fuzzified["normal_nucleoli"]["low"] = 1
        fuzzified["mitosis"]["low"] = 1
        result = evaluate_rules(fuzzified)[0]
        self.assertEqual(result, {
            "ruleNumber": 1, "activation": 1, "consequent": 2,
        })

    def test_class_4_rule_activation(self):
        fuzzified = {
            **zero_fuzzified(),
        }
        fuzzified["uniformity_cell_size"]["high"] = 1
        fuzzified["uniformity_cell_shape"]["high"] = 1
        self.assertEqual(evaluate_rules(fuzzified)[22], {
            "ruleNumber": 23, "activation": 1, "consequent": 4,
        })

    def test_accepts_output_from_existing_fuzzification(self):
        benign = {name: 1 for name in VARIABLES}
        malignant = {name: 10 for name in VARIABLES}
        self.assertAlmostEqual(evaluate_rules(fuzzify(benign))[0]["activation"], 0.9491)
        self.assertAlmostEqual(evaluate_rules(fuzzify(malignant))[22]["activation"], 0.9735)

    def test_invalid_or_missing_membership_is_reported(self):
        with self.assertRaises(ValueError):
            evaluate_rules({})
        fuzzified = zero_fuzzified()
        fuzzified["uniformity_cell_shape"]["low"] = 1.2
        with self.assertRaises(ValueError):
            evaluate_rules(fuzzified)


if __name__ == "__main__":
    unittest.main()
