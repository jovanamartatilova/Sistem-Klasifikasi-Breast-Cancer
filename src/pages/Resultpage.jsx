import bg from "../assets/Background 2.jpg";

const EXPLANATION = {
  malignant: {
    title: "Keterangan:",
    body: "Hasil klasifikasi menunjukkan bahwa karakteristik sel yang dimasukkan cenderung mengarah pada kategori malignant atau sel ganas. Artinya, terdapat kemiripan antara karakteristik sel tersebut dengan pola yang dikenali sebagai sel ganas oleh model.",
  },
  benign: {
    title: "Keterangan:",
    body: "Hasil klasifikasi menunjukkan bahwa karakteristik sel yang dimasukkan cenderung mengarah pada kategori benign atau sel jinak. Artinya, karakteristik sel tersebut lebih sesuai dengan pola yang dikenali sebagai sel jinak oleh model.",
  },
};

export default function ResultPage({ result, onRetry }) {
  const malignant = result.classLabel === 4;
  const info = EXPLANATION[malignant ? "malignant" : "benign"];

  return (
    <main className="page" style={{ backgroundImage: `url(${bg})` }}>
      <section className="card">
        <h2 className="center">Hasil Klasifikasi</h2>
        <div className={`result ${malignant ? "malignant" : "benign"}`}>
          <p className="score-title">Skor Fuzzy</p>
          <p className="score">{result.score.toFixed(2)}</p>
          <p className="label">
            {malignant ? "Malignant (Ganas)" : "Benign (Jinak)"}
          </p>
          <span className="badge">
            {malignant ? "Risiko Tinggi" : "Risiko Rendah"}
          </span>
        </div>

        <h3>{info.title}</h3>
        <p className="explain">{info.body}</p>

        <div className="center-actions">
          <button className="btn primary" onClick={onRetry}>Hitung Ulang</button>
        </div>
      </section>
    </main>
  );
}