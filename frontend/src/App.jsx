import { useState } from "react";
import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server");
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <p className="subtitle">Paste a long link, get a short one </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste your long URL here"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
        />
        <button type="submit">Shorten</button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <p>Your short link:</p>
          <a href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
