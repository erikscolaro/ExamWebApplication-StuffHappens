import { useState, useEffect, useContext } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router";
import { colors } from "../../colors.mjs";
import API from "../../api/api.mjs";
import GameRecord from "../shared/GameRecord";
import dayjs from "dayjs";
import CustomSpinner from "../shared/CustomSpinner.jsx";
import UserContext from "../../contexts/userContext";

export default function ProfilePage() {
  const { user, isLoading } = useContext(UserContext);
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const loadGames = async () => {
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
        console.error("Error loading games:", error);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, [user, navigate]);

  if (isLoading || loading) {
    return <CustomSpinner />;
  }

  return (
    <Container
      fluid
      className="p-3"
      style={{
        paddingTop: "1rem",
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
          Hi {user.username}, here are all your games{" "}
        </h2>

        {games.length === 0 ? (
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
