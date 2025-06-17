import { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import API from "../../api/api.mjs";
import GameRecord from "../shared/GameRecord";
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
      <Container className="p-3 text-center">
        {" "}
        <div style={{ color: colors.text.error || "#dc3545" }}>
          Error: User not available.
        </div>
      </Container>
    );
  }
  return (
    <Container
      fluid
      className="p-3"
      style={{
        minHeight: "100vh",
        paddingTop: "1rem",
        overflow: "visible",
      }}
    >
      <div style={{ width: "100%", maxWidth: "100%" }}>
        <h2
          style={{
            color: colors.text.accent,
            textAlign: "left",
            marginBottom: "2rem",
          }}
        >
          Hi {user.username}, here are all your games
        </h2>

        {loading ? (
          <div className="text-center p-3">
            <Spinner
              animation="border"
              style={{ color: colors.background.accent }}
            />{" "}
            <div style={{ color: colors.text.light }}>Loading...</div>
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
      </div>{" "}
    </Container>
  );
}
