import { Card, Container, Row, Col } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import dayjs from "dayjs";

export default function GameRecord({ game }) {
  // Formats a date string to DD/MM/YYYY HH:mm format
  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY HH:mm");
  // Determines if the game is won based on demo/normal mode rules
  const isGameWon = () => {
    if (!game.isEnded) return false;

    if (game.isDemo) {
      const demoRound = game.records.find((r) => r.round === 1);
      return demoRound && demoRound.wasGuessed;
    } else {
      const guessedCards = game.records.filter((r) => r.wasGuessed === true);
      return guessedCards.length >= 6;
    }
  };
  // Returns the number of correctly guessed cards
  const getGuessedCardsCount = () => {
    if (!game.records) return 0;
    
    if (game.isDemo) {
      // For demo games, count only cards guessed in round > 0
      return game.records.filter((r) => r.round > 0 && r.wasGuessed === true).length;
    } else {
      // For regular games, count all guessed cards
      return game.records.filter((r) => r.wasGuessed === true).length;
    }
  };

  // Returns the target number of cards to guess for victory
  const getTargetCardsCount = () => {
    return game.isDemo ? 1 : 6;
  };

  return (
    <Card
      style={{
        backgroundColor: colors.background.gray_800,
        border: `1px solid ${colors.background.gray_700}`,
        borderRadius: "15px",
        height: "100%",
      }}
    >
      <Card.Body style={{ color: colors.text.light }}>
        <Container fluid className="p-0">
          <Row className="mb-3">
            <Col>
              <h5
                style={{
                  color: colors.text.accent,
                  margin: 0,
                }}
              >
                Game #{game.id}
              </h5>
              <small style={{ fontSize: "0.75rem" }}>
                {formatDate(game.createdAt)}
              </small>
            </Col>
            <Col style={{ textAlign: "right" }}>
              <div>
                {game.isEnded ? (
                  isGameWon() ? (
                    <span style={{ color: colors.logic.success }}>Won 🏆</span>
                  ) : (
                    <span style={{ color: colors.logic.error }}>Lost 😢</span>
                  )
                ) : (
                  <span style={{ color: colors.text.light }}>
                    In Progress ⏳
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: colors.text.light,
                  marginTop: "0.2rem",
                }}
              >
                Cards: {getGuessedCardsCount()}/{getTargetCardsCount()}
              </div>
              {!game.isDemo && (
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: colors.text.light,
                    marginTop: "0.1rem",
                  }}
                >
                  Lives: {game.livesRemaining || 0}/3
                </div>
              )}
            </Col>
          </Row>
          {game.records && game.records.length > 0 && (
            <Row>
              <Col xs={12}>
                <h6 style={{ color: colors.text.light, marginBottom: "1rem" }}>
                  Starting cards:
                </h6>
                {game.records
                  .filter((r) => r.round === 0)
                  .sort(
                    (a, b) =>
                      (a.card?.miseryIndex || 0) - (b.card?.miseryIndex || 0)
                  )
                  .map((r, i, array) => (
                    <div key={`start-${i}`}>
                      <div
                        style={{
                          padding: "0.6rem 0",
                          fontSize: "0.85rem",
                          color: colors.text.light,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{r.card.name}</span>
                        <span style={{ color: colors.logic.success }}>✅</span>
                      </div>
                      {i < array.length - 1 && (
                        <hr
                          style={{
                            margin: "0",
                            borderColor: colors.border.light,
                            opacity: 0.3,
                          }}
                        />
                      )}
                    </div>
                  ))}

                <>
                  <h6
                    style={{
                      color: colors.text.light,
                      marginTop: "1.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    Played cards:
                  </h6>
                  {game.records.filter((r) => r.round > 0).length > 0
                    ? game.records
                        .filter((r) => r.round > 0)
                        .sort((a, b) => a.round - b.round)
                        .map((r, i, array) => (
                          <div key={`played-${i}`}>
                            <div
                              style={{
                                padding: "0.6rem 0",
                                fontSize: "0.85rem",
                                color: colors.text.light,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                opacity: r.wasGuessed ? 1 : 0.7,
                              }}
                            >
                              <span>
                                <strong>Round {r.round}:</strong>{" "}
                                {r.card?.name || "Unknown card"}
                              </span>
                              <span>
                                {r.wasGuessed && r.round !== 0 ? (
                                  <span style={{ color: colors.logic.success }}>
                                    ✅
                                  </span>
                                ) : (
                                  <span style={{ color: colors.logic.error }}>
                                    ❌
                                  </span>
                                )}
                              </span>
                            </div>
                            {i < array.length - 1 && (
                              <hr
                                style={{
                                  margin: "0",
                                  borderColor: colors.border.light,
                                  opacity: 0.3,
                                }}
                              />
                            )}{" "}
                          </div>
                        ))
                    : null}
                </>
              </Col>
            </Row>
          )}
        </Container>
      </Card.Body>
    </Card>
  );
}
