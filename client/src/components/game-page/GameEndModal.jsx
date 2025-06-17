import CustomModal from "../shared/CustomModal";
import CustomButton from "../shared/CustomButton";
import GameRecord from "../shared/GameRecord";
import { colors } from "../../colors.mjs";

export default function GameEndModal({ show, game, onNewGame }) {

  const gameWon = (() => {
    if (!game?.records) return false;
    const playedRounds = game.records.filter((r) => r.round > 0);
    const guessedCards = playedRounds.filter((r) => r.wasGuessed);
    return guessedCards.length === playedRounds.length && playedRounds.length > 0;
  })();

  const title = gameWon ? "🏆 Congratulations! You Won!" : "😢 Game Over";

  const body = (
    <div>
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <p style={{ color: colors.text.light, margin: 0 }}>
          {gameWon 
            ? "Amazing! You correctly placed all the cards!" 
            : "Better luck next time! Here's how you did:"}
        </p>
      </div>
      {game && <GameRecord game={game} />}
    </div>
  );  const footer = (
    <div style={{ 
      display: "flex", 
      gap: "1rem", 
      width: "100%",
      padding: "0.5rem 0",
      minHeight: "50px",
      alignItems: "center"
    }}>      <CustomButton
        variant="secondary"
        linkTo={"/"}
        label="🏠 Go to Homepage"
        style={{ 
          flex: 1,
          minHeight: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      />
      <CustomButton
        variant="primary"
        onClick={onNewGame}
        label="🎮 Play a New Game"
        style={{ 
          flex: 1,
          minHeight: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      />
    </div>
  );

  return (
    <CustomModal
      show={show}
      title={title}
      body={body}
      footer={footer}
      isBlocking={true}
      onHide={() => {}} // This modal is blocking, so onHide does nothing
    />
  );
}
