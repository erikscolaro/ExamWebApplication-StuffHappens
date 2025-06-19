import { Container, Row, Col } from "react-bootstrap";
import { colors } from "../../colors.mjs";

export default function LivesIndicator({ livesRemaining = 3, maxLives = 3 }) {
  const dotStyle = (isAlive) => ({
    width: "20px",
    height: "20px",
    minWidth: "20px",
    minHeight: "20px",
    borderRadius: "50%",
    backgroundColor: isAlive
      ? colors.background.accent
      : colors.background.transparent,
    border: `2px solid ${
      isAlive ? colors.background.accent : colors.logic.error
    }`,
    transition: "all 0.3s ease",
    boxShadow: `0 0 10px ${
      isAlive ? colors.background.accentTransparent : colors.logic.error
    }`,
  });

  const containerStyle = {
    backgroundColor: colors.background.gray_800,
    border: `1px solid ${
      livesRemaining ? colors.border.accent : colors.logic.error
    }`,
    borderRadius: "9999px",
    boxShadow: `0 4px 8px ${colors.background.gray_700}`,
    width: "fit-content",
    gap: "8px",
    minWidth: "160px",
  };

  const labelStyle = {
    color: colors.text.accent,
    fontFamily: "'Bangers', sans-serif",
    fontSize: "1.2rem",
  };

  return (
    <Container style={containerStyle}>
      <Row className="d-flex p-0 justify-content-center align-items-center gap-2 px-3 py-1">
        <Col className="p-0">
          <span style={labelStyle}>LIVES:</span>
        </Col>
        {Array.from({ length: maxLives }, (_, index) => (
          <Col key={index} className="p-0">
            <Container
              fluid
              className="p-0"
              style={dotStyle(index < livesRemaining)}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
