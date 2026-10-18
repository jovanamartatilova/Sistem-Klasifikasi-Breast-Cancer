import { useState, useEffect } from "react";
import Home from "./pages/Home";
import InputPage from "./pages/InputPage";
import ResultPage from "./pages/Resultpage";
import { classify } from "./utils/Mamdani";
import "./App.css";

export default function App() {
  const saved = JSON.parse(sessionStorage.getItem("app") || "null");
  const [page, setPage] = useState(saved?.page ?? "home");
  const [inputs, setInputs] = useState(saved?.inputs ?? null);
  const result = inputs ? classify(inputs) : null;

  useEffect(() => {
    sessionStorage.setItem("app", JSON.stringify({ page, inputs }));
  }, [page, inputs]);

  const handleSubmit = (data) => {
    setInputs(data);
    setPage("result");
  };

  return (
    <>
      {page === "home" && <Home onStart={() => setPage("input")} />}
      {page === "input" && (
        <InputPage onBack={() => setPage("home")} onSubmit={handleSubmit} />
      )}
      {page === "result" && inputs && (
        <ResultPage inputs={inputs} result={result} onRetry={() => setPage("input")} />
      )}
    </>
  );
}