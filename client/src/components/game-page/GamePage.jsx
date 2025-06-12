import { Col, Container, Row } from "react-bootstrap";
import CustomCard from "./CustomCard";
import { Game } from "../../models/game.mjs";
import { colors } from "../../colors.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";


export default function GamePage() {
  const gametest = {
    id: 35,
    createdAt: "2025-06-09T18:49:16.292Z",
    roundNum: 2,
    isEnded: true,
    isDemo: false,
    records: [
      {
        card: {
          id: 24,
          name: "Card 24",
          imageFilename: "default.png",
          miseryIndex: 1000,
        },
        round: 0,
        wasGuessed: true,
        timedOut: false,
      },
      {
        card: {
          id: 41,
          name: "Card 41",
          imageFilename: "default.png",
          miseryIndex: 4,
        },
        round: 2,
        wasGuessed: false,
        timedOut: false,
      },
      {
        card: {
          id: 42,
          name: "Card 42",
          imageFilename: "default.png",
          miseryIndex: 5,
        },
        round: 3,
        wasGuessed: false,
        timedOut: false,
      },
      {
        card: {
          id: 4,
          name: "Card 4",
          imageFilename: "default.png",
          miseryIndex: 55,
        },
        round: 1,
        wasGuessed: false,
        timedOut: false,
      },
      {
        card: {
          id: 21,
          name: "Card 21",
          imageFilename: "default.png",
          miseryIndex: 77,
        },
        round: 0,
        wasGuessed: true,
        timedOut: false,
      },
      {
        card: {
          id: 45,
          name: "Card 45",
          imageFilename: "default.png",
          miseryIndex: 89.5,
        },
        round: 0,
        wasGuessed: true,
        timedOut: false,
      },
    ],
  };
  const game = Game.fromJSON(gametest);
  console.log("Game object:", game);
  const cards = game.getCardsIdsOrdered();
  console.log("Ordered cards:", cards);
  return <CardsArea cards={cards} />;
}

function CardsArea({ cards }) {
  return (
    <Container
      fluid
      className="justify-content-center gap-3"
      style={{
        backgroundColor: colors.background.transparent,
        borderRadius: "10px",
        width: "100%",
        overflow: "hidden",
        borderBottom: `2px solid ${colors.border.accent}`,
      }}
    >
      <Col>
        <Row
          className="justify-content-center gap-3"
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            flexWrap: "nowrap",
            scrollbarWidth: "thin",
            scrollbarColor: `${colors.background.gray_700} transparent`,
          }}
        >
          {cards.map((card) => (
            <CustomCard key={card.id} card={card} />
          ))}
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
            style={{ fontFamily: "'Bangers', sans-serif", fontSize: "1.5rem"}}
          >
            Sfigometro
          </Col>
          <Col className="text-end">
            <i className="bi bi-plus-circle" style={{ fontSize: "1.5rem" }}></i>
          </Col>
        </Row>
      </Col>
    </Container>
  );
}

function NewCardArea() {
  return (
    <div className="new-card-area">
      <h2>New Card Area</h2>
      {/* Additional content can be added here */}
    </div>
  );
}

function CountdownTimer() {
  return (
    <div className="countdown-timer">
      <h2>Countdown Timer</h2>
      {/* Additional content can be added here */}
    </div>
  );
}
