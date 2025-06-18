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
  const [game, setGame] = useState(null);
  const [roundCurrent, setRoundCurrent] = useState(0);
  const [nextCard, setNextCard] = useState(null);
  const [selector, setSelector] = useState(null);
  const [gameIsPlaying, setGameIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [countdownKey, setCountdownKey] = useState(0);
  const [timerIsPlaying, setTimerIsPlaying] = useState(false);

  const startTimer = () => {
    setCountdownKey((prevKey) => prevKey + 1);
    setTimerIsPlaying(true);
  };

  const sendAnswer = async () => {
    setTimerIsPlaying(false);

    let cards = getCardsIdsOrdered(game);
    cards.splice(selector, 0, nextCard);
    const cardIds = cards.map((c) => c.id);

    try {
      let result = null;
      if (isLogged) {
        result = await API.checkAnswerGame(
          user.id,
          game.id,
          roundCurrent,
          cardIds
        );
      } else {
        result = await API.checkAnswerDemo(game.id, roundCurrent, cardIds);
      }
      setRoundResult(result);
      if (result.isEnded === true) {
        setGame((prevGame) => ({ ...prevGame, isEnded: result.isEnded }));
        setShowGameEndModal(true);
      } else {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error sending answer:", error);
    }

    setSelector(null);
  };

  const handleCountdownComplete = async () => {
    await sendAnswer();
    setShowModal(true);
    return {
      shouldRepeat: false,
      delay: 0,
    };
  };

  const handleGameAction = async () => {
    if (game.roundNum === 0) {
      setRoundCurrent(1);
    } else {
      await sendAnswer();
    }
  };

  const handleContinueToNextRound = () => {
    setShowModal(false);
    setRoundCurrent((roundCurrent) => roundCurrent + 1);
  };

  const handleNewGame = () => {
    setShowGameEndModal(false);

    setGameIsPlaying(false);
  };

  useEffect(() => {
    const initializeGame = async () => {
      try {
        let result = null;
        if (isLogged) {
          result = await API.createGame(user.id);
        } else {
          result = await API.createDemoGame();
        }
        setGame(Game.fromJSON(result));
        setRoundCurrent(0);
        setCountdownKey((prevKey) => prevKey + 1);
        setNextCard(null);
      } catch (error) {
        console.error("Error initializing game:", error);
        throw error;
      }
    };

    if (gameIsPlaying) return;
    else {
      setGameIsPlaying(true);
      initializeGame();
    }
  }, [user, isLogged, roundCurrent, gameIsPlaying]);

  useEffect(() => {
    const fetchNextRound = async () => {
      try {
        let result = null;
        if (isLogged) {
          result = await API.nextRoundGame(user.id, game.id, roundCurrent);
        } else {
          result = await API.nextRoundDemo(game.id, roundCurrent);
        }
        setGame(Game.fromJSON(result.game));
        setNextCard(result.nextCard);
        startTimer();
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
    fetchNextRound();
  }, [roundCurrent, game, isLogged, user]);

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
              Press "Continue" to face the next round!
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
              isPlaying={timerIsPlaying}
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
          </Col>
          <Col>
            <NewCardArea card={nextCard} />
          </Col>
        </Row>
        <CardsArea
          cards={getCardsIdsOrdered(game)}
          selector={selector}
          setSelector={setSelector}
          roundStarted={game.roundNum > 0 && timerIsPlaying}
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
