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
import GameEndModal from "./GameEndModal";
import { Game } from "../../models/game.mjs";
import { Card } from "../../models/card.mjs";
import LivesIndicator from "./LivesIndicator";
import UserContext from "../../contexts/userContext";
import CustomSpinner from "../shared/CustomSpinner.jsx";

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

/**
 * Adds or updates a game record for a specific round
 * @param {Game} game - The game object to update
 * @param {Card} card - The card played
 * @param {number} round - The round number
 * @param {boolean} wasGuessed - Whether the answer was correct
 * @param {string} requestedAt - When the card was requested
 * @param {string} respondedAt - When the answer was submitted
 */
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
    id: null, // id - not needed on frontend
    gameId: game.id,
    cardId: card ? card.id : null,
    card: card,
    round: round,
    wasGuessed: wasGuessed,
    timedOut: false, // assume false for now
    requestedAt: requestedAt || new Date().toISOString(),
    respondedAt: respondedAt || new Date().toISOString(),
  };

  if (existingRecordIndex >= 0) {
    // Update existing record
    game.records[existingRecordIndex] = gameRecord;
  } else {
    // Add new record
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

    // If user has selected a position, insert the new card
    if (selector !== null && selector !== undefined) {
      cards.splice(selector, 0, nextCard);
    }
    // If no selection (selector is null), send only existing cards (timeout/no answer)

    const cardIds = cards.map((c) => c.id);
    try {
      console.log("[VERIFY ANSWER] Request params:", {
        userId: user?.id,
        gameId: game?.id,
        roundCurrent: roundCurrent,
        cardIds: cardIds,
      });

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

      console.log("[VERIFY ANSWER] Server response:", result);

      // Extract isCorrect from gameRecord
      const isCorrect =
        result.gameRecord && result.gameRecord.wasGuessed === true;

      setRoundResult({
        ...result,
        isCorrect: isCorrect, // Add isCorrect for backward compatibility with modal
      });
      // Update game object with the response data and add the game record
      setGame((prevGame) => {
        const updatedGame = { ...prevGame };

        // Update lives and ended status from server response
        updatedGame.livesRemaining = result.livesRemaining;
        updatedGame.isEnded = result.isEnded; // Add the game record - only if the answer was correct
        if (result.gameRecord && result.gameRecord.card) {
          // Correct answer: use the card with misery index from server
          addOrUpdateRecord(
            updatedGame,
            Card.fromJSON(result.gameRecord.card),
            roundCurrent,
            true, // wasGuessed = true
            result.gameRecord.requestedAt,
            result.gameRecord.respondedAt
          );
        }
        // If answer was wrong (result.gameRecord.card is null), don't save any record

        return updatedGame;
      });

      if (result.isEnded === true) {
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
    // Don't allow actions if game is ended
    if (game?.isEnded) {
      return;
    }

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
        if (user) {
          result = await API.createGame(user.id);
        } else {
          result = await API.createDemoGame();
        }
        console.log("[GAME CREATION] Server response:", result);
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

  useEffect(() => {
    const fetchNextRound = async () => {
      try {
        console.log("[DRAW CARD] Request params:", {
          userId: user?.id,
          gameId: game?.id,
          roundCurrent: roundCurrent
        });

        let result = null;
        if (user) {
          result = await API.nextRoundGame(user.id, game.id, roundCurrent);
        } else {
          result = await API.nextRoundDemo(game.id, roundCurrent);
        }
        console.log("[DRAW CARD] Server response:", result);
        setGame((prevGame) => {
          const newGameData = Game.fromJSON(result.game);
          // Preserve existing records and update only the game state properties
          return {
            ...prevGame,
            roundNum: newGameData.roundNum,
            isEnded: newGameData.isEnded,
            livesRemaining: newGameData.livesRemaining, // Keep existing records - don't overwrite with empty array from server
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
      game.isEnded // Don't fetch next round if game is ended
    )
      return;
    fetchNextRound();
  }, [roundCurrent, game, user]);    if (isLoading || !game) {
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
            {/* Widget delle vite */}
            {game && (
              <LivesIndicator
                livesRemaining={game.livesRemaining || 3}
                maxLives={3}
              />
            )}
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
                marginBottom: "20px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              
              <CustomButton
                label={!nextCard ? "Start Game" : "Submit Solution"}
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
