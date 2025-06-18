import { colors } from "../../colors.mjs";

export default function LivesIndicator({ livesRemaining = 3, maxLives = 3 }) {
  const renderLifeCircle = (index) => {
    const isAlive = index < livesRemaining;
    
    return (
      <div
        key={index}
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: isAlive ? colors.logic.error : "transparent",
          border: `2px solid ${colors.logic.error}`,
          transition: "all 0.3s ease",
          boxShadow: isAlive ? "0 0 10px rgba(220, 53, 69, 0.3)" : "none",
        }}
      />
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 20px",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        border: `1px solid ${colors.logic.error}`,
        borderRadius: "20px",
        backdropFilter: "blur(10px)",
        marginBottom: "20px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <span
        style={{
          color: colors.background.white,
          fontFamily: "'Bangers', sans-serif",
          fontSize: "1.2rem",
          marginRight: "10px",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
          letterSpacing: "0.5px",
        }}
      >
        LIVES:
      </span>
      <div style={{ display: "flex", gap: "6px" }}>
        {Array.from({ length: maxLives }, (_, index) => renderLifeCircle(index))}
      </div>
    </div>
  );
}
