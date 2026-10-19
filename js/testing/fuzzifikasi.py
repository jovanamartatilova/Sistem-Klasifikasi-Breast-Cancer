"""
Fuzzifikasi FRBS Deteksi Kanker Payudara
Replikasi: Gupta et al. (2023), "A fuzzy rule-based system with decision tree
for breast cancer detection", IET Image Processing 17(7), 2083-2096.

Parameter fungsi keanggotaan diambil dari Tabel 3 jurnal.
  - 4 angka [a b c d] -> trapesium (sama seperti trapmf di MATLAB)
  - 3 angka [p q r]   -> segitiga   (sama seperti trimf di MATLAB)
Domain input WBCD: 1-10.
"""

# ---------------------------------------------------------------------------
# 1. Fungsi keanggotaan
# ---------------------------------------------------------------------------
def trapmf(x, a, b, c, d):
    """Trapesium: 0 di <=a, naik a->b, 1 di b..c, turun c->d, 0 di >=d."""
    if x < a or x > d:
        return 0.0
    if b <= x <= c:
        return 1.0
    if x < b:                      # sisi naik
        return (x - a) / (b - a)
    return (d - x) / (d - c)       # sisi turun


def trimf(x, a, b, c):
    """Segitiga: 0 di <=a, naik a->b (puncak=1), turun b->c, 0 di >=c."""
    if x <= a or x >= c:
        return 0.0
    if x <= b:
        return (x - a) / (b - a)
    return (c - x) / (c - b)


def mf(x, params):
    """Pilih jenis fungsi keanggotaan dari jumlah parameter."""
    if len(params) == 4:
        return trapmf(x, *params)
    if len(params) == 3:
        return trimf(x, *params)
    raise ValueError("Parameter harus 3 (segitiga) atau 4 (trapesium) angka")


# ---------------------------------------------------------------------------
# 2. Definisi variabel input (Tabel 2 & Tabel 3 jurnal)
# ---------------------------------------------------------------------------
# key -> (label, {himpunan: [parameter]})
VARIABLES = {
    "clump_thickness": ("A1 - Clump Thickness", {
        "low":    [-3.75, -0.417, 2.04, 3.11],
        "medium": [2.09, 2.96, 4.9, 5.91],
        "high":   [5.023, 6.1, 10.9, 14.3],
    }),
    "uniformity_cell_size": ("A2 - Uniformity of Cell Size", {
        "low":  [-3.75, -0.417, 2.09, 3.137],
        "high": [2.04, 3.37, 9.91, 13.3],
    }),
    "uniformity_cell_shape": ("A3 - Uniformity of Cell Shape", {
        "low":  [-3.75, -0.417, 1.47, 3.06],
        "high": [1.53, 3.78, 10.4, 13.7],
    }),
    "marginal_adhesion": ("A4 - Marginal Adhesion", {
        "low":  [-3.75, -0.417, 0.903, 2.137],
        "high": [0.995, 2.09, 10.25, 13.1],
    }),
    "single_epi_cell_size": ("A5 - Single Epithelial Cell Size", {
        "low":  [-3.75, -0.417, 1.89, 3.08],
        "high": [1.97, 3.125, 10.4, 13.8],
    }),
    "bare_nuclei": ("A6 - Bare Nuclei", {
        "low":  [-3.75, -0.417, 1.04, 2.045],
        "high": [1.03, 2.153, 10.4, 13.8],
    }),
    "bland_chromatin": ("A7 - Bland Chromatin", {
        "low":  [-3.75, -0.417, 0.903, 2.06],
        "high": [1.01, 2.137, 10.4, 13.8],
    }),
    "normal_nucleoli": ("A8 - Normal Nucleoli", {
        "low":    [-3.75, -0.417, 1.97, 3.063],
        "medium": [1.94, 2.97, 4.04, 5.023],
        "high":   [4.07, 5.008, 10.1, 13.4],
    }),
    "mitosis": ("A9 - Mitosis", {
        "low":  [-3.75, -0.417, 0.9491, 1.95],
        "high": [1.01, 1.998, 10.4, 13.8],
    }),
}

# Output (Tabel 3): 3 angka -> segitiga. Domain output sekitar 0-1.42
OUTPUT = {
    "class_2": [0.00231, 0.5, 0.9992],   # benign
    "class_4": [0.5054, 1.0, 1.42],      # malignant
}

INPUT_MIN, INPUT_MAX = 1, 10


# ---------------------------------------------------------------------------
# 3. Fuzzifikasi
# ---------------------------------------------------------------------------
def fuzzify_variable(name, x):
    """Derajat keanggotaan satu input -> {'low': 1.0, 'high': 0.0, ...}"""
    if name not in VARIABLES:
        raise KeyError(f"Variabel tidak dikenal: {name}")
    if not (INPUT_MIN <= x <= INPUT_MAX):
        raise ValueError(f"{name}={x} di luar rentang {INPUT_MIN}-{INPUT_MAX}")
    _, sets = VARIABLES[name]
    return {label: round(mf(x, p), 4) for label, p in sets.items()}


def fuzzify(sample):
    """Fuzzifikasi semua 9 input. sample = dict {nama_variabel: nilai}."""
    missing = set(VARIABLES) - set(sample)
    if missing:
        raise ValueError(f"Input kurang: {sorted(missing)}")
    return {name: fuzzify_variable(name, sample[name]) for name in VARIABLES}


def print_fuzzification(sample, title=""):
    result = fuzzify(sample)
    print(f"\n=== {title} ===")
    for name, degrees in result.items():
        label = VARIABLES[name][0]
        ds = ", ".join(f"{k}={v:.4f}" for k, v in degrees.items())
        print(f"{label:35s} x={sample[name]:<5} -> {ds}")
    return result


# ---------------------------------------------------------------------------
# 4. Pengujian
# ---------------------------------------------------------------------------
def run_tests():
    # Sampel dari Gambar 3a jurnal (hasil: low risk / benign)
    benign = dict(clump_thickness=2, uniformity_cell_size=1,
                  uniformity_cell_shape=2, marginal_adhesion=1,
                  single_epi_cell_size=3, bare_nuclei=1,
                  bland_chromatin=2, normal_nucleoli=1, mitosis=1)
    # Baris ke-2 dari Gambar 3b (Actual Output = 4, malignant)
    malignant = dict(clump_thickness=8, uniformity_cell_size=10,
                     uniformity_cell_shape=10, marginal_adhesion=8,
                     single_epi_cell_size=7, bare_nuclei=10,
                     bland_chromatin=9, normal_nucleoli=7, mitosis=1)
    # Nilai tengah: area overlap antar himpunan
    borderline = dict(clump_thickness=5, uniformity_cell_size=3,
                      uniformity_cell_shape=3, marginal_adhesion=2,
                      single_epi_cell_size=3, bare_nuclei=2,
                      bland_chromatin=2, normal_nucleoli=3, mitosis=2)

    print_fuzzification(benign, "Sampel 1: benign (Gambar 3a)")
    print_fuzzification(malignant, "Sampel 2: malignant (Gambar 3b)")
    print_fuzzification(borderline, "Sampel 3: area overlap")

    # --- Assertion terhadap perhitungan manual -----------------------------
    # Clump thickness = 2 -> Low di plateau (1.0), Medium & High = 0
    assert fuzzify_variable("clump_thickness", 2) == \
        {"low": 1.0, "medium": 0.0, "high": 0.0}
    # Clump thickness = 5 -> Medium turun: (5.91-5)/(5.91-4.9) = 0.9010,
    #                        High naik:    (5-5.023) <0 -> 0.0
    r = fuzzify_variable("clump_thickness", 5)
    assert abs(r["medium"] - 0.9010) < 1e-3 and r["high"] == 0.0 and r["low"] == 0.0
    # Clump thickness = 3 -> Low turun: (3.11-3)/(3.11-2.04)=0.1028
    #                        Medium di plateau (2.96..4.9) -> 1.0
    r = fuzzify_variable("clump_thickness", 3)
    assert abs(r["low"] - 0.1028) < 1e-3 and r["medium"] == 1.0
    # Bare nuclei = 1 -> Low = 1 ; High = (1-1.03)<0 -> 0
    assert fuzzify_variable("bare_nuclei", 1) == {"low": 1.0, "high": 0.0}
    # Bare nuclei = 10 -> Low 0, High 1
    assert fuzzify_variable("bare_nuclei", 10) == {"low": 0.0, "high": 1.0}
    # Uniformity cell size = 3 -> Low: (3.137-3)/(3.137-2.09)=0.1309
    #                             High: (3-2.04)/(3.37-2.04)=0.7218
    r = fuzzify_variable("uniformity_cell_size", 3)
    assert abs(r["low"] - 0.1309) < 1e-3 and abs(r["high"] - 0.7218) < 1e-3
    # Output: titik puncak
    assert trimf(0.5, *OUTPUT["class_2"]) == 1.0
    assert trimf(1.0, *OUTPUT["class_4"]) == 1.0
    # Validasi rentang
    for bad in (0, 11):
        try:
            fuzzify_variable("mitosis", bad)
            raise AssertionError("seharusnya error")
        except ValueError:
            pass

    print("\nSemua pengujian lulus.")


def plot_membership_functions(save_path="membership_functions.png"):
    """Opsional: reproduksi Gambar 2(a-j). Butuh matplotlib & numpy."""
    import numpy as np
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(5, 2, figsize=(12, 14))
    axes = axes.ravel()
    xs = np.linspace(1, 10, 500)
    for ax, (name, (label, sets)) in zip(axes, VARIABLES.items()):
        for s, p in sets.items():
            ax.plot(xs, [mf(x, p) for x in xs], label=s)
        ax.set_title(label)
        ax.set_ylim(-0.05, 1.05)
        ax.legend(fontsize=7)
    xo = np.linspace(0, 1.42, 500)
    ax = axes[9]
    for s, p in OUTPUT.items():
        ax.plot(xo, [mf(x, p) for x in xo], label=s)
    ax.set_title("Output (Class 2 / Class 4)")
    ax.legend(fontsize=7)
    plt.tight_layout()
    plt.savefig(save_path, dpi=120)
    print(f"Plot disimpan ke {save_path}")


if __name__ == "__main__":
    run_tests()
    try:
        plot_membership_functions()
    except ImportError:
        print("matplotlib belum terpasang, plot dilewati.")