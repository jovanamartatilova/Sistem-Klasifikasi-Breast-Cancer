import bg from "../assets/Background.jpg";

export default function Home({ onStart }) {
  return (
    <section className="hero" style={{ backgroundImage: `url(${bg})` }}>
      <div className="hero-content">
        <h1>Klasifikasi Breast Cancer</h1>
        <p className="hero-subtitle">Metode Fuzzy Mamdani</p>
        <p className="hero-text">
          Sistem ini mengklasifikasikan sampel sel sebagai jinak (benign) atau
          ganas (malignant) dari 9 atribut hasil pemeriksaan
        </p>
        <button className="btn primary hero-btn" onClick={onStart}>
          Mulai klasifikasi
        </button>
      </div>
    </section>
  );
}