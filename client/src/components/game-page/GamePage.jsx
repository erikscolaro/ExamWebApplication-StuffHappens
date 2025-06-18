import { Col, Container, Row } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useContext, useEffect, useState } from "react";
import CustomButton from "../shared/CustomButton";
import API from "../../api/api.mjs";
import CustomModal from "../shared/CustomModal";
import CardsArea from "./CardsArea";
import NewCardArea from "./NewCardArea";
import CountdownTimer from "./CountdownTimer";
import { Game } from "../../models/game.mjs";
import { Card } from "../../models/card.mjs";
import LivesIndicator from "./LivesIndicator";
import UserContext from "../../contexts/userContext";
import CustomSpinner from "../shared/CustomSpinner.jsx";

// Returns cards from game records ordered by misery index
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

// Adds or updates a game record for a specific round
function addOrUpdateRecord(
  game,
  card,
  round,
  wasGuessed,
  requestedAt = null,
  respondedAt = null
) {
  const existingRecordIndex = game.records.findIndex((r) => r.round === round);
  const gameRecord = {
    id: null,
    gameId: game.id,
    cardId: card ? card.id : null,
    card: card,
    round: round,
    wasGuessed: wasGuessed,
    timedOut: false,
    requestedAt: requestedAt || new Date().toISOString(),
    respondedAt: respondedAt || new Date().toISOString(),
  };
  if (existingRecordIndex >= 0) {
    game.records[existingRecordIndex] = gameRecord;
  } else {
    game.records.push(gameRecord);
  }
}

export default function GamePage() {
  const { user, isLoading } = useContext(UserContext);

  const [game, setGame] = useState(null);
  const [roundCurrent, setRoundCurrent] = useState(0);
  const [nextCard, setNextCard] = useState(null);
  const [selector, setSelector] = useState(null);
  const [gameIsPlaying, setGameIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [roundResult, setRoundResult] = useState(null);
  const [countdownKey, setCountdownKey] = useState(0);
  const [timerIsPlaying, setTimerIsPlaying] = useState(false);

  // Starts the countdown timer for the current round
  const startTimer = () => {
    setCountdownKey((prevKey) => prevKey + 1);
    setTimerIsPlaying(true);
  };

  // Sends the player's answer to the server and updates game state
  const sendAnswer = async () => {
    setTimerIsPlaying(false);
    let cards = getCardsIdsOrdered(game);

    if (selector !== null && selector !== undefined) {
      cards.splice(selector, 0, nextCard);
    }

    const cardIds = cards.map((c) => c.id);
    try {
      let result = null;
      if (user) {
        result = await API.checkAnswerGame(
          user.id,
          game.id,
          roundCurrent,
          cardIds
        );
      } else {
        result = await API.checkAnswerDemo(game.id, roundCurrent, cardIds);
      }
      const isCorrect =
        result.gameRecord && result.gameRecord.wasGuessed === true;

      setRoundResult({
        ...result,
        isCorrect: isCorrect,
      });

      setGame((prevGame) => {
        const updatedGame = { ...prevGame };

        updatedGame.livesRemaining = result.livesRemaining;
        updatedGame.isEnded = result.isEnded;

        if (result.gameRecord && result.gameRecord.card) {
          addOrUpdateRecord(
            updatedGame,
            Card.fromJSON(result.gameRecord.card),
            roundCurrent,
            true,
            result.gameRecord.requestedAt,
            result.gameRecord.respondedAt
          );
        }
        return updatedGame;
      });

      if (result.isEnded !== true) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error sending answer:", error);
    }

    setSelector(null);
  };

  // Handles countdown timer completion (timeout scenario)
  const handleCountdownComplete = async () => {
    await sendAnswer();
    setShowModal(true);
    return {
      shouldRepeat: false,
      delay: 0,
    };
  };

  // Handles the main game action button (start game, submit answer, or new game)
  const handleGameAction = async () => {
    if (game?.isEnded) {
      handleStartNewGame();
      return;
    }

    if (game.roundNum === 0) {
      setRoundCurrent(1);
    } else {
      await sendAnswer();
    }
  };

  // Closes the round result modal and moves to the next round
  const handleContinueToNextRound = () => {
    setShowModal(false);
    setRoundCurrent((roundCurrent) => roundCurrent + 1);
  };

  // Resets all game states and starts a new game
  const handleStartNewGame = () => {
    setRoundCurrent(0);
    setNextCard(null);
    setSelector(null);
    setShowModal(false);
    setRoundResult(null);
    setTimerIsPlaying(false);
    setTimeout(() => {
      setGameIsPlaying(false);
    }, 0);
  };

  // Creates a new game when gameIsPlaying becomes false
  useEffect(() => {
    const initializeGame = async () => {
      try {
        let result = null;
        if (user) {
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
  }, [user, roundCurrent, gameIsPlaying]);

  // Fetches the next card when starting a new round
  useEffect(() => {
    const fetchNextRound = async () => {
      try {
        let result = null;
        if (user) {
          result = await API.nextRoundGame(user.id, game.id, roundCurrent);
        } else {
          result = await API.nextRoundDemo(game.id, roundCurrent);
        }
        setGame((prevGame) => {
          const newGameData = Game.fromJSON(result.game);
          return {
            ...prevGame,
            roundNum: newGameData.roundNum,
            isEnded: newGameData.isEnded,
            livesRemaining: newGameData.livesRemaining,
          };
        });
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
      !game.id ||
      !roundCurrent ||
      roundCurrent == game.roundNum ||
      game.isEnded
    )
      return;
    fetchNextRound();
  }, [roundCurrent, game, user]);
  if (isLoading || !game) {
    return <CustomSpinner />;
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
        className="d-flex p-3 flex-column justify-content-center align-items-center gap-5"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <Row
          className="justify-content-between align-items-center"
          style={{ width: "100%" }}
        >
          <Col>
            {!game.isEnded && (
              <CountdownTimer
                key={countdownKey}
                resetKey={countdownKey}
                isPlaying={timerIsPlaying}
                onComplete={handleCountdownComplete}
              />
            )}
          </Col>
          <Col className="text-center gap-3 d-flex flex-column align-items-center">
            {game && (
              <LivesIndicator
                livesRemaining={
                  game.livesRemaining !== undefined ? game.livesRemaining : 3
                }
                maxLives={3}
              />
            )}
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
              {game.isEnded
                ? (!game.isDemo && game.livesRemaining > 0) ||
                  (game.isDemo && game.livesRemaining === 3)
                  ? "YOU WON!"
                  : "YOU LOSE!"
                : game.roundNum === 0
                ? "READY ?"
                : `ROUND ${game.roundNum}`}
            </h2>
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
                label={
                  game.isEnded
                    ? "Start a New Game"
                    : !nextCard
                    ? "Start Game"
                    : "Submit Solution"
                }
                onClick={handleGameAction}
                variant="primary"
              />
            </div>
          </Col>
          <Col>{!game.isEnded && <NewCardArea card={nextCard} />}</Col>
        </Row>
        <CardsArea
          cards={getCardsIdsOrdered(game)}
          selector={selector}
          setSelector={setSelector}
          roundStarted={game.roundNum > 0 && timerIsPlaying && !game.isEnded}
          showButtons={!game.isEnded}
        />
      </Container>
    </>
  );
}
