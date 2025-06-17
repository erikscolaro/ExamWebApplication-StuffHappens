import { Col, Container, Row } from "react-bootstrap";
import CustomCard from "./CustomCard";
import { colors } from "../../colors.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import CircleButton from "./CircleButton";
import { Fragment } from "react";

export default function CardsArea({ cards, selector, setSelector, roundStarted = true }) {
  return (
    <Container
      fluid
      className="d-flex flex-column justify-content-center"
      style={{
        backgroundColor: colors.background.transparent,
        borderRadius: "10px",
        width: "100%",
        borderBottom: `2px solid ${colors.border.accent}`,
      }}
    >
      <Row
        className="d-flex flex-nowrap justify-content-center align-items-center gap-2"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.background.accentDarkTransparent} transparent`,
        }}
      >        <CircleButton
          key={0}
          id={0}
          actuallyPressed={selector}
          setPressed={setSelector}
          roundStarted={roundStarted}
        />
        {
          // react needs a key also for the fragment to correctly manage the list
          cards.map((card, index) => (
            <Fragment key={`fragment-${index}`}>
              <CustomCard card={card} />              <CircleButton
                id={index + 1}
                actuallyPressed={selector}
                setPressed={setSelector}
                roundStarted={roundStarted}
              />
            </Fragment>
          ))
        }
      </Row>
      <Row
        className="justify-content-between align-items-end"
        style={{
          color: colors.text.accent,
          padding: "5px",
        }}
      >
        <Col className="text-start">
          <i className="bi bi-dash-circle" style={{ fontSize: "1.5rem" }}></i>
        </Col>
        <Col
          className="text-center"
          style={{ fontFamily: "'Bangers', sans-serif", fontSize: "1.5rem" }}
        >
          Misery Scale
        </Col>
        <Col className="text-end">
          <i className="bi bi-plus-circle" style={{ fontSize: "1.5rem" }}></i>
        </Col>
      </Row>
    </Container>
  );
}
