# Breast Cancer Classification System Using Fuzzy Mamdani

## 1. Project Overview

This project is a web-based breast cancer classification system developed using the Mamdani Fuzzy Inference System (FIS).

The application classifies breast cancer cell characteristics into two categories: **Benign (Class 2)** and **Malignant (Class 4)** based on nine numerical attributes.

The system integrates a React-based user interface with fuzzy logic components, including fuzzification, rule-based inference, aggregation, and centroid defuzzification.

**Purpose:** To demonstrate the application of knowledge-based systems and fuzzy reasoning in a medical classification case study.

> Disclaimer: This system is an academic prototype and is not intended for clinical diagnosis or medical decision-making.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend interface |
| Vite | Development and build tool |
| JavaScript | Fuzzy logic implementation |
| Node.js | Development environment and automated testing |
| CSS | Interface styling |
| Git & GitHub | Version control and collaboration |

## 3. System Architecture

The classification process follows six stages:

**User Input → Fuzzification → Rule Evaluation → Aggregation → Defuzzification → Classification**

### User Input

The application collects nine breast cancer cell attributes:

1. Clump Thickness
2. Uniformity of Cell Size
3. Uniformity of Cell Shape
4. Marginal Adhesion
5. Single Epithelial Cell Size
6. Bare Nuclei
7. Bland Chromatin
8. Normal Nucleoli
9. Mitosis

Each input must be an integer between 1 and 10.

### Fuzzification

Numerical inputs are converted into fuzzy membership degrees using triangular and trapezoidal membership functions.

The membership functions describe linguistic categories such as Low, Medium, and High, depending on the attribute.

### Rule-Based Inference

The system implements 27 fuzzy IF–THEN rules.

Each rule evaluates its antecedents using the Mamdani MIN operator to determine its activation strength.

### Aggregation

The activated rules are combined using the MAX operator to produce an aggregated fuzzy output.

### Defuzzification

The centroid method converts the aggregated fuzzy output into a numerical score.

The centroid is calculated as:

\[
z^* = \frac{\int z\mu(z)\,dz}{\int \mu(z)\,dz}
\]

The numerical implementation uses trapezoidal integration.

### Classification

The final score is interpreted using the following threshold:

| Score | Classification |
|---|---|
| Score below 0.8 | Benign (Class 2) |
| Score 0.8 or above | Malignant (Class 4) |

If no fuzzy rule is activated, the system reports an error rather than generating an unsupported classification.

## 4. Main Features

- Web-based interface for entering nine numerical attributes.
- Input validation for required fields and values between 1 and 10.
- Fuzzy Mamdani classification using 27 rules.
- Numerical score and classification result display.
- Benign and Malignant result explanations.
- Error handling for invalid inputs and calculation failures.
- Session recovery and reset functionality.

## 5. Project Structure

```text
Sistem-Klasifikasi-Breast-Cancer/
├── js/
│   ├── fuzzifikasi.js
│   ├── rulebase.js
│   └── testing/
├── src/
│   ├── assets/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Inputpage.jsx
│   │   └── Resultpage.jsx
│   ├── utils/
│   │   ├── Mamdani.js
│   │   ├── AgregasiDefuzzifikasi.js
│   │   └── fields.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── tests/
│   ├── integrasi.test.js
│   └── diagnostic.test.js
├── index.html
├── package.json
└── vite.config.js
```

## 6. Installation and Setup

### Prerequisites

- Node.js (compatible with the installed Vite version)
- npm
- Git

### Clone the Repository

```bash
git clone https://github.com/jovanamartatilova/Sistem-Klasifikasi-Breast-Cancer.git
```

### Enter the Project Directory

```bash
cd Sistem-Klasifikasi-Breast-Cancer
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Build for Production

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## 7. How to Use

1. Open the application in a web browser.
2. Select the option to start classification.
3. Enter the nine required cell attribute values.
4. Click **Hitung** to perform classification.
5. View the fuzzy score and classification result.
6. Select **Hitung Ulang** to perform another classification.

## 8. Testing and Evaluation

The system was evaluated using automated integration tests and synthetic diagnostic samples.

### Automated Testing

The following command executes the integration tests:

```bash
node --test tests/integrasi.test.js
```

**Results:**

| Metric | Result |
|---|---:|
| Integration test cases | 12 |
| Passed | 12 |
| Failed | 0 |

### Diagnostic Testing

The diagnostic test evaluates rule coverage and output consistency:

```bash
node --test tests/diagnostic.test.js
```

**Results:**

| Metric | Result |
|---|---:|
| Total synthetic samples | 1,522 |
| Successfully classified | 1,505 |
| Unclassified samples | 17 |
| Processing success rate | 98.88% |
| Benign results | 176 |
| Malignant results | 1,329 |
| Rule coverage | 27/27 |
| Output inconsistencies | 0 |

All 27 fuzzy rules were activated at least once.

Seventeen samples did not activate any rule and therefore could not be defuzzified. This represents a rule coverage limitation rather than a numerical classification result.

**Note:** Processing success rate must not be interpreted as classification accuracy.

### Code Quality

- Automated integration tests: Passed
- Diagnostic tests: Passed
- ESLint: Passed
- Production build: Passed

A non-blocking missing-font warning was observed for `TanPearl.otf`.

## 9. Current Limitations

- The fuzzy rule base does not cover every possible input combination.
- Diagnostic tests use synthetic samples rather than a labeled clinical dataset.
- Classification accuracy against reference medical data has not yet been established.
- The system is intended for academic demonstration, not clinical deployment.

## 10. Future Improvements

Potential improvements include expanding and validating rule coverage, evaluating performance using labeled datasets, comparing numerical outputs with published reference results, improving explainability, and enhancing cross-device usability.

## 11. References

Gupta et al. (2023). Reference publication used for the fuzzy membership functions and rule base. *IET Image Processing, 17*(7), 2083–2096.

Full bibliographic details should be verified against the original publication.

## 12. Conclusion

This project demonstrates the implementation of a web-based knowledge-based classification system using the Fuzzy Mamdani approach.

The application integrates nine input attributes, fuzzy membership functions, 27 inference rules, MAX aggregation, centroid defuzzification, and a React user interface.

Testing confirms that the implemented pipeline executes consistently for the tested scenarios while identifying limitations in rule coverage that require further investigation.

The system provides an educational example of how fuzzy reasoning and rule-based knowledge representation can be implemented in a web application.