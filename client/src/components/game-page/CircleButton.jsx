import { Button } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function CircleButton({
  id,
  actuallyPressed,
  setPressed,
  roundStarted = true,
}) {
  return (
    <Button
      id={id}
      onClick={() => {
        if (!roundStarted) return;
        if (id === actuallyPressed) {
          setPressed(null);
          return;
        }
        setPressed(id);
      }}
      style={{
        width: "25px",
        height: "25px",
        borderRadius: "50%",
        backgroundColor:
          id === actuallyPressed
            ? colors.background.accent
            : colors.background.gray_800,
        border: `${
          id === actuallyPressed
            ? "2px solid " + colors.border.dark
            : "2px solid " + colors.border.accent
        }`,
        boxShadow:
          id === actuallyPressed
            ? `0 0 8px ${colors.background.accent}`
            : `0 0 4px ${colors.background.accent}`,
        alignItems: "center",
        justifyContent: "center",
        transition:
          "transform 0.2s ease, background-color 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, height 0.2s ease, width 0.2s ease, border-radius 0.2s ease",
        zIndex: 10,
        cursor: roundStarted ? "pointer" : "not-allowed",
        opacity: roundStarted ? 1 : 0.6,
      }}
      onMouseEnter={(e) => {
        if (!roundStarted) return; // Blocca l'animazione se il round non è iniziato

        e.currentTarget.style.height = "300px";
        e.currentTarget.style.width = "220px";
        e.currentTarget.style.borderRadius = "22px";
      }}
      onMouseLeave={(e) => {
        if (!roundStarted) return; // Blocca l'animazione se il round non è iniziato

        e.currentTarget.style.height = "25px";
        e.currentTarget.style.width = "25px";
        e.currentTarget.style.borderRadius = "50%";
      }}
      className="d-flex align-items-center justify-content-center"
    >
      <span
        style={{
          width: "100%",
          height: "100%",
          alignContent: "center",
          color:
            id === actuallyPressed
              ? colors.text.dark
              : colors.background.accent,
          fontWeight: "bold",
          fontSize: "1.5rem",
          opacity: 0,
          transition: "opacity 0.3s ease",
        }}
        onMouseEnter={(e) => {
          if (!roundStarted) return; // Blocca l'animazione del testo se il round non è iniziato

          e.currentTarget.style.transition = "opacity 0.15s ease";
          e.currentTarget.style.transitionDelay = "0.3s";
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          if (!roundStarted) return; // Blocca l'animazione del testo se il round non è iniziato

          e.currentTarget.style.transition = "opacity 0s";
          e.currentTarget.style.opacity = "0";
        }}
      >
        {id === actuallyPressed
          ? `You selected position ${id + 1}`
          : "Press to insert here"}
      </span>
    </Button>
  );
}
