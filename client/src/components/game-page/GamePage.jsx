import { Col, Container, Modal, Row } from "react-bootstrap";
import CustomCard from "./CustomCard";
import { colors } from "../../colors.mjs";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import CustomButton from "../shared/CustomButton";
import API from "../../api/api.mjs";

export default function GamePage({ isLogged, user }) {
  console.log("GamePage props:", { isLogged, user });

  const [game, setGame] = useState(null);
  const [roundCurrent, setRoundCurrent] = useState(0);
  const [nextCard, setNextCard] = useState(null);
  const [answer] = useState([1, 2, 3, 4]); // setAnswer not used

  // modal management
  const [showModal, setShowModal] = useState(false);
  const [roundResult, setRoundResult] = useState(null);

  // timer management
  const [countdownKey, setCountdownKey] = useState(0); // Key to force re-render of the timer when needed
  const [isPlaying, setIsPlaying] = useState(false); // Timer state - starts paused

  const startTimer = () => {
    setCountdownKey((prevKey) => prevKey + 1); // Increment key to force re-render
    setIsPlaying(true); // Start the timer
  };

  const handleCountdownComplete = async () => {
    console.log("Countdown completed!");

    await sendAnswer(); // Send answer when countdown completes

    setShowModal(true); // Show modal when countdown completes

    return {
      shouldRepeat: false, // Set to true if you want the timer to repeat
      delay: 0, // Delay before the next countdown starts
    };
  };

  // Initialize game when component mounts or user changes
  useEffect(() => {
    const initializeGame = async () => {
      console.log("Initializing game...");
      try {
        let result = null;
        console.log(
          "User logged in initialize game=:",
          isLogged,
          "User data:",
          user
        );
        if (isLogged) {
          result = await API.createGame(user.id);
        } else {
          result = await API.createDemoGame();
        }
        setGame(result);
      } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
      }
    };

    initializeGame();
  }, [user, isLogged]);

  // Fetch next round when roundCurrent changes
  useEffect(() => {
    const fetchNextRound = async () => {
      console.log("Fetching next round...");
      try {
        let result = null;
        console.log("current round:", roundCurrent);
        if (isLogged) {
          result = await API.nextRoundGame(user.id, game.id, roundCurrent);
        } else {
          result = await API.nextRoundDemo(game.id, roundCurrent);
        }
        setGame(result.game);
        setNextCard(result.nextCard);
        console.log("Next card fetched:", result.nextCard);
        startTimer(); // Start the timer for the new round
      } catch (error) {
        console.error("Error fetching next round:", error);
        throw error;
      }
    };

    if (!game || !roundCurrent || roundCurrent == game.roundNum) return;
    // manage here the case where game is ended.
    console.log("Round changed, fetching next round...");
    fetchNextRound();
  }, [roundCurrent, game, isLogged, user]);

  const sendAnswer = async () => {
    console.log("Sending answer for round:", roundCurrent);
    setIsPlaying(false); // Stop the timer when sending answer
    console.log("Answer to send:", answer);
    try {
      let result = null;
      if (isLogged) {
        result = await API.checkAnswerGame(
          user.id,
          game.id,
          roundCurrent,
          answer
        );
      } else {
        result = await API.checkAnswerDemo(game.id, roundCurrent, answer);
      }
      console.log("Answer sent successfully:", result);
      setRoundResult(result);
      setShowModal(true); // Show modal with result
    } catch (error) {
      console.error("Error sending answer:", error);
    }
  };

  // Loading animation while game is being fetched
  if (!game) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{
          height: "100vh",
          backgroundColor: colors.background.primary,
        }}
      >
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  console.log("Game state:", game);
  console.log("Round current:", roundCurrent);
  console.log("Next card:", nextCard);
  return (
    <>
      <CustomModal
        show={showModal}
        title={`Round ${game.roundNum} Result`}
        body={
          showModal && roundResult.isCorrect ? (
            <div>
              🎉 Great! You answered correctly!
              <br />
              Keep it up, you're on the right track.
              <br />
              Press "Continue" to face the next round.
            </div>
          ) : (
            <div>
              😢 Oops! Wrong answer.
              <br />
              In the next round you won't see the card you played.
              <br />
              Press "Continue" to try again!
            </div>
          )
        }
        footer={
          <CustomButton
            label="Continue"
            onClick={() => {
              setShowModal(false);
              setRoundCurrent((roundCurrent) => roundCurrent + 1); // Move to the next round
            }}
          />
        }
        isBlocking={true}        onHide={() => setShowModal(false)}
      />
      <Container
        fluid
        className="d-flex p-3 flex-column justify-content-center gap-5"
      >
        <Row className="justify-content-between align-items-center">
          <Col>
            <CountdownTimer
              key={countdownKey}
              resetKey={countdownKey}
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
                {game.roundNum === 0 ? "READY ?" : `ROUND ${game.roundNum}`}
              </h2>
            </div>
            <div
              style={{
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <CustomButton
                label={game.roundNum === 0 ? "Start Game" : "Submit Solution"}
                onClick={async () => {
                  if (game.roundNum === 0) {
                    setRoundCurrent(1); // Start the first round
                  } else {
                    await sendAnswer(); // Send the answer for the current round
                  }
                }}
                variant="primary"
              />
            </div>
          </Col>
          <Col>
            <NewCardArea card={nextCard} />
          </Col>
        </Row>
        <CardsArea cards={game.getCardsIdsOrdered()} />
      </Container>
    </>
  );
}

function CustomModal({ show, title, body, footer, isBlocking = true, onHide }) {
  const style = {
    background: colors.background.gray_800,
    color: colors.text.light,
    border: `1px solid ${colors.background.gray_700}`,
  };
  return (
    <Modal
      show={show}
      onHide={isBlocking ? () => {} : onHide}
      centered
      backdrop={isBlocking ? "static" : true}
      keyboard={!isBlocking}
      style={{
        backgroundColor: colors.background.darkTransparent,
      }}
    >
      {title && (
        <Modal.Header style={style} closeButton={!isBlocking}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {body && <Modal.Body style={style}>{body}</Modal.Body>}
      {footer && <Modal.Footer style={style}>{footer}</Modal.Footer>}
    </Modal>
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
        <Col className="text-start">          <i className="bi bi-dash-circle" style={{ fontSize: "1.5rem" }}></i>
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

function NewCardArea(props) {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center"
      style={{
        position: "relative",      }}
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
      >        {props.card == null ? <></> : <CustomCard card={props.card} />}
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

function CountdownTimer({ resetKey, isPlaying, onComplete }) {
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
        backgroundColor: colors.background.gray_800,      }}
    >
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={30}
        key={resetKey}
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
