import MarketDashboard from "./MarketDashboard";

function App() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Positioning Analytics</h1>
      <div
        role="alert"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          padding: "0.9rem 1.1rem",
          borderRadius: "8px",
          border: "1px solid #f0ad4e",
          backgroundColor: "#fff8e5",
          color: "#7a4a00",
          fontWeight: 600,
        }}
      >
        <span aria-hidden="true" style={{ fontSize: "1.5rem", lineHeight: 1 }}>
          &#9888;
        </span>
        <div>
          <div>COT data is temporarily unavailable.</div>
          <div style={{ fontSize: "0.9rem", fontWeight: 400 }}>
            Updates resume once the US government shutdown ends and the CFTC publishes new reports.
          </div>
        </div>
      </div>
      <MarketDashboard />
    </div>
  );
}

export default App;
