import { Container } from "react-bootstrap";
import { colors } from "../../colors.mjs";

export default function CustomSpinner() {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
      }}
    >
      <div
        className="spinner-border"
        role="status"
        style={{
          color: colors.background.accent,
          width: "2rem",
          height: "2rem",
        }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </Container>
  );
}
