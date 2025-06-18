import { Container, Row, Col, Card } from "react-bootstrap";
import { colors } from "../colors.mjs";
import { Link } from "react-router";
import CustomButton from "./shared/CustomButton";
import { useContext } from "react";
import UserContext from "../contexts/userContext";

/**
 * HomePage component that serves as the main landing page
 * Shows different content based on user authentication status
 */
function HomePage() {
  const highlight = {
    color: colors.text.accent,
    fontWeight: "bold",
  };

  const {user } = useContext(UserContext);

  return (
    <Container
      fluid
      className="p-3 d-flex flex-column align-items-center justify-content-center"
      style={{
        height: "100%",
      }}
    >
      <div>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            marginBottom: 20,
            color: colors.text.accent,
            fontWeight: "700",
          }}
        >
          Stuff Happens - Game Rules
        </h2>
        <ol
          style={{
            lineHeight: 1.6,
            color: colors.text.light,
            textAlign: "left",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <li>
            Start with <span style={highlight}>3 cards</span>, representing
            horrible situations ordered by misery (from 1.0 to 100.0).
          </li>          <li>
            Each round you'll be shown <span style={highlight}>a new situation</span> with a
            description and image, but without the misery index.
          </li>
          <li>
            You must guess <span style={highlight}>where it ranks</span> compared to the cards you have.
          </li>
          <li>
            You have <span style={highlight}>30 seconds</span> to answer:
            <ul>
              <li>
                If you guess correctly, the card is added to your collection and
                you'll see its details.
              </li>
              <li>If you guess wrong or time runs out, you lose the card!</li>
            </ul>
          </li>
          <li>
            <span style={highlight}>Win</span> if you guess all rounds and
            end with 6 cards, <span style={highlight}>lose</span> otherwise.
          </li>
          <li>At the end you'll see a summary and can start a new game.</li>
          <li>
            If logged in, you can play a full 3-round game with saved
            history; if anonymous, only a 1-round demo.
          </li>
        </ol>

        <div className="text-center mt-4">
          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "1rem",
              color: colors.text.light,
            }}
          >
            Test your skills and have fun with the game!
          </p>

          <CustomButton
            label={user ? "Play a Game" : "Try a Demo"}
            linkTo={user ? "/play" : "/demo"}
            variant="primary"
            style={{
              padding: "12px 30px",
              fontSize: "1.2rem",
            }}
          />
        </div>
      </div>
    </Container>
  );
}

export default HomePage;
