import { useState } from "react";
import bg from "../assets/Background 2.jpg";
import { FIELDS } from "../utils/fields.js";

const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.key, ""]));
const BLOCKED_KEYS = ["e", "E", "+", "-", ".", ","];

// Mengembalikan pesan error, atau "" kalau nilainya valid
function validate(value) {
  if (value === "") return "";
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 10) return "Isi angka bulat 1-10.";
  return "";
}

export default function InputPage({
    onBack,
    onSubmit,
    classificationError = "",
  }) {
    const [values, setValues] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const handleChange = (key, value) => {
      setValues({ ...values, [key]: value });
      setErrors({ ...errors, [key]: validate(value) });
    };

  const handleSubmit = () => {
    const newErrors = {};
    FIELDS.forEach(({ key }) => {
      if (values[key] === "") newErrors[key] = "Wajib diisi.";
      else {
        const msg = validate(values[key]);
        if (msg) newErrors[key] = msg;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const numeric = Object.fromEntries(
      FIELDS.map(({ key }) => [key, Number(values[key])]),
    );
    onSubmit(numeric);
  };

  return (
    <main className="page" style={{ backgroundImage: `url(${bg})` }}>
      <section className="card">
        <h2 className="form-title">Masukkan Data Sampel</h2>
        <p className="subtitle">Setiap atribut bernilai 1-10.</p>

        {classificationError && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              backgroundColor: "#fff1f2",
              color: "#9f1239",
              border: "1px solid #fecdd3",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <strong>Proses klasifikasi gagal.</strong>
            <p style={{ margin: "6px 0 0" }}>{classificationError}</p>
          </div>
        )}

        {FIELDS.map(({ key, label }) => (
          <div className="field" key={key}>
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onKeyDown={(e) =>
                BLOCKED_KEYS.includes(e.key) && e.preventDefault()
              }
              onWheel={(e) => e.target.blur()}
              className={errors[key] ? "invalid" : ""}
            />
            {errors[key] && <span className="error">{errors[key]}</span>}
          </div>
        ))}

        <div className="actions">
          <button className="btn" onClick={onBack}>
            Kembali
          </button>
          <button className="btn primary" onClick={handleSubmit}>
            Hitung
          </button>
        </div>
      </section>
    </main>
  );
}