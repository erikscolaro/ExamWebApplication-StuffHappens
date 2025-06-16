import { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Card } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import API from "../../api/api.mjs";
import dayjs from "dayjs";

export default function HistoryPage({ user }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadGameHistory = async () => {
      try {
        const result = await API.getGamesHistory(user.id);
        const gamesWithDayjs = result.map((game) => ({
          ...game,
          createdAt: dayjs(game.createdAt),
        }));
        setGames(
          gamesWithDayjs.sort(
            (a, b) => b.createdAt.valueOf() - a.createdAt.valueOf()
          )
        );
      } catch (error) {
        console.error("Error loading game history:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGameHistory();
  }, [user]);

  if (!user) {
    return (
      <Container className="p-3 text-center">        <div style={{ color: colors.text.error || "#dc3545" }}>
          Error: User not available.
        </div>
      </Container>
    );
  }
  return (    <Container fluid className="p-3" style={{ 
      minHeight: "100vh",
      paddingTop: "1rem",
      overflow: "visible"
    }}>
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <h2
          style={{
            color: colors.text.accent,
            textAlign: "left",
            marginBottom: "2rem",
          }}          >
            Hi {user.username}, here are all your games
          </h2>

        {loading ? (
          <div className="text-center p-3">
            <Spinner
              animation="border"
              style={{ color: colors.background.accent }}
            />            <div style={{ color: colors.text.light }}>Loading...</div>
          </div>
        ) : games.length === 0 ? (
          <div style={{ color: colors.text.light, textAlign: "center" }}>
            You haven't played any games yet!
          </div>
        ) : (
          <Row className="g-3">
            {games.map((game) => (
              <Col key={game.id} xs={12} md={6} lg={4}>
                <GameRecord game={game} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Container>
  );
}

function GameRecord({ game }) {
  const formatDate = (date) => {    return dayjs.isDayjs(date)
      ? date.format("DD/MM/YYYY HH:mm")
      : "Date not available";
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
                }}              >
                Game #{game.id}
              </h5>
              <small style={{ fontSize: "0.75rem" }}>
                {formatDate(game.createdAt)}
              </small>
            </Col>
            <Col style={{ textAlign: "right" }}>
              <div>
                {game.records &&
                  game.records.filter((r) => r.round > 0).length > 0 &&
                  (game.records
                    .filter((r) => r.round > 0)
                    .every((r) => r.wasGuessed) ? (                    <span style={{ color: colors.logic.success }}>🏆 Won</span>
                  ) : (
                    <span style={{ color: colors.logic.error }}>😢 Lost</span>
                  ))}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: colors.text.light,
                  marginTop: "0.2rem",
                }}              >
                Cards:
                {game.records
                  ? game.records.filter((r) => r.round > 0 && r.wasGuessed)
                      .length
                  : 0}
                /
                {game.records
                  ? game.records.filter((r) => r.round > 0).length
                  : 0}
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
                  )                  .map((r, i, array) => (
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
                        <span
                        >
                          Round {r.round}: {r.card?.name || "Unknown card"}
                        </span>
                        <span
                        >
                          {r.wasGuessed ? "✅" : "❌"}
                        </span>
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
