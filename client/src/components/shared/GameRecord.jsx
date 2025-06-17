import { Card, Container, Row, Col } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import dayjs from "dayjs";

export default function GameRecord({ game }) {
  const formatDate = (date) => dayjs(date).format("DD/MM/YYYY HH:mm");

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
              {" "}
              <div>
                {game.records &&
                game.records.filter((r) => r.round > 0).length > 0 &&
                (() => {
                  const playedRounds = game.records.filter((r) => r.round > 0);
                  const guessedCards = playedRounds.filter((r) => r.wasGuessed);
                  return guessedCards.length === playedRounds.length;
                })() ? (
                  <span style={{ color: colors.logic.success }}>Won 🏆</span>
                ) : (
                  <span style={{ color: colors.logic.error }}>Lost 😢</span>
                )}
              </div>{" "}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: colors.text.light,
                  marginTop: "0.2rem",
                }}
              >
                Cards:
                {game.records
                  ? game.records.filter((r) => r.round > 0 && r.wasGuessed)
                      .length
                  : 0}
                /{game.isDemo ? 1 : 3}
              </div>
            </Col>
          </Row>

          {game.records && game.records.length > 0 && (
            <Row>
              <Col
                xs={6}
                style={{
                  borderRight: `1px solid ${colors.background.gray_700}`,
                  paddingRight: "15px",
                }}
              >
                <h6 style={{ color: colors.text.light }}>Starting cards:</h6>
                {game.records
                  .filter((r) => r.round === 0)
                  .sort(
                    (a, b) =>
                      (a.card?.miseryIndex || 0) - (b.card?.miseryIndex || 0)
                  )
                  .map((r, i, array) => (
                    <div key={i}>
                      <div
                        style={{
                          padding: "0.2rem 0",
                          fontSize: "0.8rem",
                          color: colors.text.light,
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {r.card.name}
                      </div>
                      {i < array.length - 1 && (
                        <hr
                          style={{
                            margin: "0",
                            borderColor: colors.background.gray_700,
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </div>
                  ))}
              </Col>

              <Col xs={6} style={{ paddingLeft: "15px" }}>
                <h6 style={{ color: colors.text.light }}>Played cards:</h6>
                {game.records
                  .filter((r) => r.round > 0)
                  .sort((a, b) => a.round - b.round)
                  .map((r, i, array) => (
                    <div key={i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          padding: "0.2rem 0",
                          fontSize: "0.8rem",
                          color: colors.text.light,
                          flexWrap: "wrap",
                          gap: "0.3rem",
                        }}
                      >
                        <span>
                          Round {r.round}: {r.card?.name || "Unknown card"}
                        </span>
                        <span>{r.wasGuessed ? "✅" : "❌"}</span>
                      </div>
                      {i < array.length - 1 && (
                        <hr
                          style={{
                            margin: "0",
                            borderColor: colors.background.gray_700,
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </div>
                  ))}
              </Col>
            </Row>
          )}
        </Container>
      </Card.Body>
    </Card>
  );
}
