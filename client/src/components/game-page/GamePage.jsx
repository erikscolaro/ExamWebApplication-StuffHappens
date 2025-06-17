import { Col, Container, Row } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import CustomButton from "../shared/CustomButton";
import API from "../../api/api.mjs";
import CustomModal from "../shared/CustomModal";
import CardsArea from "./CardsArea";
import NewCardArea from "./NewCardArea";
import CountdownTimer from "./CountdownTimer";
import GameEndModal from "./GameEndModal";
import { Game } from "../../models/game.mjs";

// External function to get cards ordered by misery index
function getCardsIdsOrdered(game) {
  if (!game || !game.records) return [];

  return game.records
    .filter((record) => record.round <= game.roundNum && record.card)
    .map((record) => record.card)
    .filter(
      (card) => card.miseryIndex !== undefined && card.miseryIndex !== null
    )
    .sort((a, b) => a.miseryIndex - b.miseryIndex);
}

export default function GamePage({ isLogged, user }) {
  console.log("GamePage props:", { isLogged, user }); // State management
  const [game, setGame] = useState(null);
  const [roundCurrent, setRoundCurrent] = useState(0);
  const [nextCard, setNextCard] = useState(null);
  const [answer, setAnswer] = useState([1, 2, 3, 4]);
  const [selector, setSelector] = useState(null); // Track selected position for the answer
  // Modal management
  const [showModal, setShowModal] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);

  // Timer management
  const [countdownKey, setCountdownKey] = useState(0); // Key to force re-render of the timer when needed
  const [isPlaying, setIsPlaying] = useState(false); // Timer state - starts paused

  // Timer utility functions
  const startTimer = () => {
    setCountdownKey((prevKey) => prevKey + 1); // Increment key to force re-render
    setIsPlaying(true); // Start the timer
  };

  const sendAnswer = async () => {
    console.log("Sending answer for round:", roundCurrent);
    setIsPlaying(false); // Stop the timer when sending answer

    // calculating the answer based on the selected position
    if (selector === null) {
      console.log("No card selected, i will send an empty answer.");
      setAnswer([]);
    } else {
      console.log("Card selected:", selector);
      const cards = getCardsIdsOrdered(game);
      cards.splice(selector, 0, nextCard);
      setAnswer(cards.map((c) => c.id));
    }

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
      if (result.isEnded === true) {
        setGame((prevGame) => ({ ...prevGame, isEnded: result.isEnded })); // Update game state if it has ended
        setShowGameEndModal(true);
      } else {
        setShowModal(true); // Show modal with result
      }
    } catch (error) {
      console.error("Error sending answer:", error);
    }

    // Reset the selector after sending the answer
    setSelector(null);
  };

  // Event handlers
  const handleCountdownComplete = async () => {
    console.log("Countdown completed!");
    await sendAnswer(); // Send answer when countdown completes
    setShowModal(true); // Show modal when countdown completes
    return {
      shouldRepeat: false, // Set to true if you want the timer to repeat
      delay: 0, // Delay before the next countdown starts
    };
  };

  const handleGameAction = async () => {
    if (game.roundNum === 0) {
      setRoundCurrent(1); // Start the first round
    } else {
      await sendAnswer(); // Send the answer for the current round
    }
  };

  const handleContinueToNextRound = () => {
    setShowModal(false);
    setRoundCurrent((roundCurrent) => roundCurrent + 1); // Move to the next round
  };

  // Effects
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
          result = await API.createGame(user.id);        } else {
          result = await API.createDemoGame();
        }
        setGame(Game.fromJSON(result));
      } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
      }
    };

    if (roundCurrent > 0) return; // Don't reinitialize if already in a round
    initializeGame();
  }, [user, isLogged, roundCurrent]);

  // Fetch next round when roundCurrent changes
  useEffect(() => {
    const fetchNextRound = async () => {
      console.log("Fetching next round...");
      try {
        let result = null;
        console.log("current round:", roundCurrent);
        if (isLogged) {
          result = await API.nextRoundGame(user.id, game.id, roundCurrent);        } else {
          result = await API.nextRoundDemo(game.id, roundCurrent);
        }
        setGame(Game.fromJSON(result.game));
        setNextCard(result.nextCard);
        console.log("Next card fetched:", result.nextCard);
        startTimer(); // Start the timer for the new round
      } catch (error) {
        console.error("Error fetching next round:", error);
        throw error;
      }
    };

    if (
      roundCurrent === 0 ||
      !game ||
      !roundCurrent ||
      roundCurrent == game.roundNum
    )
      return;
    // manage here the case where game is ended.
    console.log("Round changed, fetching next round...");
    fetchNextRound();
  }, [roundCurrent, game, isLogged, user]);

  // Handler for starting a new game (placeholder for now)
  const handleNewGame = () => {
    // TODO: Implement new game logic
    console.log("New game requested - to be implemented");
  };

  // Render loading state
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
        <div
          className="spinner-border"
          role="status"
          style={{ color: colors.background.accent }}
        >
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
          <CustomButton label="Continue" onClick={handleContinueToNextRound} />
        }
        isBlocking={true}
        onHide={() => setShowModal(false)}
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
                onClick={handleGameAction}
                variant="primary"
              />
            </div>
          </Col>{" "}
          <Col>
            <NewCardArea card={nextCard} />
          </Col>{" "}
        </Row>
        <CardsArea
          cards={getCardsIdsOrdered(game)}
          selector={selector}
          setSelector={setSelector}
          roundStarted={game.roundNum > 0 && isPlaying}
        />
      </Container>

      {/* Game end modal */}
      <GameEndModal
        show={showGameEndModal}
        game={game}
        onNewGame={handleNewGame}
      />
    </>
  );
}
