import { useState, useEffect } from "react";
import Home from "./pages/Home";
import InputPage from "./pages/Inputpage";
import ResultPage from "./pages/Resultpage";
import { classify } from "./utils/Mamdani";
import "./App.css";

// Memulihkan sesi tanpa membuat aplikasi crash.
function loadSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("app") || "null");

    if (!saved) {
      return {
        page: "home",
        inputs: null,
        result: null,
        error: "",
      };
    }

    if (saved.page === "result" && saved.inputs) {
      const result = classify(saved.inputs);

      return {
        page: "result",
        inputs: saved.inputs,
        result,
        error: "",
      };
    }

    return {
      page: saved.page === "input" ? "input" : "home",
      inputs: null,
      result: null,
      error: "",
    };
  } catch (error) {
    console.error("Gagal memulihkan sesi:", error);

    return {
      page: "input",
      inputs: null,
      result: null,
      error:
        "Data sesi sebelumnya tidak dapat diproses. " +
        "Silakan masukkan data kembali.",
    };
  }
}

export default function App() {
  const [state, setState] = useState(loadSession);

  const { page, inputs, result, error } = state;

  useEffect(() => {
    try {
      sessionStorage.setItem("app", JSON.stringify({ page, inputs }));
    } catch (storageError) {
      console.error("Gagal menyimpan sesi:", storageError);
    }
  }, [page, inputs]);

  const handleSubmit = (data) => {
    try {
      const classification = classify(data);

      setState({
        page: "result",
        inputs: data,
        result: classification,
        error: "",
      });
    } catch (classificationError) {
      console.error("Kesalahan klasifikasi:", classificationError);

      setState({
        page: "input",
        inputs: null,
        result: null,
        error:
          classificationError.message || "Terjadi kesalahan saat klasifikasi.",
      });
    }
  };

  const handleRetry = () => {
    setState({
      page: "input",
      inputs: null,
      result: null,
      error: "",
    });
  };

  return (
    <>
      {page === "home" && (
        <Home
          onStart={() =>
            setState({
              page: "input",
              inputs: null,
              result: null,
              error: "",
            })
          }
        />
      )}

      {page === "input" && (
        <InputPage
          onBack={() =>
            setState({
              page: "home",
              inputs: null,
              result: null,
              error: "",
            })
          }
          onSubmit={handleSubmit}
          classificationError={error}
        />
      )}

      {page === "result" && result && (
        <ResultPage inputs={inputs} result={result} onRetry={handleRetry} />
      )}
    </>
  );
}