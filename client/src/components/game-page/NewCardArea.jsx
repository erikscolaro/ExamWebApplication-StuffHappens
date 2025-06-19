import { Container, Row } from "react-bootstrap";
import CustomCard from "./CustomCard";
import { colors } from "../../colors.mjs";

export default function NewCardArea({ card }) {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center"
      style={{
        position: "relative",
      }}
    >
      <Row
        style={{
          borderRadius: "22px",
          backgroundColor: colors.background.transparent,
          boxShadow: `
            0 0 40px ${colors.background.accentTransparent},
            0 0 20px ${colors.background.accentTransparent}
          `,
          height: "300px",
          width: "220px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {card == null ? <></> : <CustomCard card={card} />}
      </Row>
      <Row
        style={{
          fontFamily: "'Bangers', sans-serif",
          fontSize: "1.5rem",
          color: colors.text.accent,
          position: "absolute",
          top: "100%",
          width: "fit-content",
          borderRadius: "999px",
          padding: "0px 20px",
        }}
      >
        Your Card
      </Row>
    </Container>
  );
}
