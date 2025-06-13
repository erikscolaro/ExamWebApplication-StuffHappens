import { Card, Col, Container, Row } from "react-bootstrap";
import CustomCard from "./CustomCard";
import { Game } from "../../models/game.mjs";
import { Card as CardModel } from "../../models/card.mjs";
import { colors } from "../../colors.mjs";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState } from "react";
import CustomButton from "../shared/CustomButton";

export default function GamePage() {
  const gametest = {
    id: 35,
    createdAt: "2025-06-09T18:49:16.292Z",
    roundNum: 0,
    isEnded: false,
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
        round: 0,
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
        round: 0,
        wasGuessed: false,
        timedOut: false,
      },
    ],
  };
  const nextCard = {
    id: 43,
    name: "Card 43",
    imageFilename: "default.png",
  };
  const game = Game.fromJSON(gametest);
  console.log("Game object:", game);
  const cards = game.getCardsIdsOrdered();
  console.log("Ordered cards:", cards);
  const card = CardModel.fromJSON(nextCard);
  console.log("Next card:", card);

  // timer management
  const [countdownKey, setCountdownKey] = useState(0); // Key to force re-render of the timer when needed
  const [isPlaying, setIsPlaying] = useState(true); // Timer state

  const startTimer = () => {
    setCountdownKey((prevKey) => prevKey + 1); // Increment key to force re-render
    setIsPlaying(true); // Start the timer
  };

  const sendAPICall = () => {
    // Simulate an API call to send the current game state
    console.log("Sending game state to server...");
    // Here you would typically use fetch or axios to send the data
  };

  const handleCountdownComplete = () => {
    console.log("Countdown completed!");
    // Handle the countdown completion logic here
    return {
      shouldRepeat: false, // Set to true if you want the timer to repeat
      delay: 0, // Delay before the next countdown starts
    };
  };

  // useeffect for debug
  useState(() => {
    startTimer(); // Start the timer when the component mounts
    console.log("GamePage mounted");
    console.log("Cards:", cards);
    console.log("Next card:", card);
  }, []);

  return (
    <Container
      fluid
      className="d-flex p-3 flex-column justify-content-between"
      style={{
        height: "100%",
      }}
    >
      <Row className="justify-content-between align-items-center">
        <Col>
          <CountdownTimer
            key={countdownKey}
            isPlaying={isPlaying}
            onComplete={handleCountdownComplete}
          />
        </Col>
        <Col className="text-center">
          <div
            style={{
              padding: "15px 25px",
              marginBottom: "15px",
            }}
          >
            <h2 
              style={{ 
                color: colors.background.white,
                fontFamily: "'Bangers', sans-serif",
                fontSize: "3rem",
                margin: 0,
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                letterSpacing: "1px",
              }}
            >
              ROUND {gametest.roundNum + 1}
            </h2>
          </div>
          <div 
            style={{ 
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <CustomButton
              label="Invia soluzione"
              onClick={sendAPICall}
              variant="primary"
            />
          </div>
        </Col>
        <Col>
          <NewCardArea card={card} />
        </Col>
      </Row>
      <CardsArea cards={cards} />
    </Container>
  );
}

function CardsArea({ cards }) {
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
        className="justify-content-center gap-3"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          flexWrap: "nowrap",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.background.accentDarkTransparent} transparent`,
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
          style={{ fontFamily: "'Bangers', sans-serif", fontSize: "1.5rem" }}
        >
          Sfigometro
        </Col>
        <Col className="text-end">
          <i className="bi bi-plus-circle" style={{ fontSize: "1.5rem" }}></i>
        </Col>
      </Row>
    </Container>
  );
}

function NewCardArea(props) {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center"
      style={{
        position: "relative",
      }}
    >
      {" "}
      <Row
        style={{
          borderRadius: "22px",
          backgroundColor: colors.background.transparent,
          boxShadow: `
            0 0 40px ${colors.background.accentTransparent},
            0 0 20px ${colors.background.accentTransparent}
          `,
          height: "300px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {props.card == null ? (
          <CustomCard card={props.card} />
        ) : (
          <CustomCard placeholder={true} />
        )}
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
        La tua carta
      </Row>
    </Container>
  );
}

function CountdownTimer({ key, isPlaying, onComplete }) {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        border: `1px solid ${colors.background.gray_700}`,
        width: "fit-content",
        height: "fit-content",
        padding: "20px",
        borderRadius: "40px",
        boxShadow: "0 0 20px " + colors.background.gray_800,
        backgroundColor: colors.background.gray_800,
      }}
    >
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={30}
        key={key}
        onComplete={onComplete}
        colors={colors.background.accent}
        size={175}
        strokeWidth={8}
        updateInterval={0.05}
        trailStrokeWidth={1}
        trailColor={colors.background.gray_700}
      >
        {({ remainingTime }) => (
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: colors.text.light,
            }}
          >
            {remainingTime} s
          </div>
        )}
      </CountdownCircleTimer>
    </Container>
  );
}
