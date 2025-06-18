import { Container, Row, Col, Card } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import { Link } from "react-router";
import CustomButton from "../shared/CustomButton";
import { useContext } from "react";
import UserContext from "../../contexts/userContext";

/**
 * HomePage component that serves as the main landing page
 * Shows different content based on user authentication status
 */
function HomePage() {
  const highlight = {
    color: colors.text.accent,
    fontWeight: "bold",
  };

  const { user } = useContext(UserContext);
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        width: "80%",
        minHeight: "100%",
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
            margin: "0 auto",
          }}
        >
          <li>
            Start with <span style={highlight}>3 cards</span> representing
            horrible situations ordered by misery (from 1.0 to 100.0).
          </li>
          <li>
            Each round you'll be shown{" "}
            <span style={highlight}>a new situation</span> with a description
            and image, but without the misery index.
          </li>
          <li>
            <span style={highlight}>How to play:</span>
            <ul>
              <li>
                <span style={highlight}>Click the circular buttons</span> below
                your cards to select where the new card should be positioned in
                your collection
              </li>
              <li>
                Choose the position that best represents the misery level
                compared to your existing cards
              </li>
              <li>
                <span style={highlight}>
                  Press the central "Submit Answer" button
                </span>{" "}
                to confirm your choice
              </li>
              <li>
                You have <span style={highlight}>30 seconds</span> - a countdown
                timer shows your remaining time
              </li>
            </ul>
          </li>
          <li>
            <span style={highlight}>Results:</span>
            <ul>
              <li>
                If you guess correctly, the card is added to your collection and
                you'll see its misery index revealed
              </li>
              <li>
                If you guess wrong or time runs out, you lose a life! The
                correct position is shown
              </li>
              <li>
                <span style={highlight}>Click "Continue"</span> after each
                result to proceed to the next round
              </li>
            </ul>
          </li>
          <li>
            <span style={highlight}>Victory conditions:</span> Win by correctly
            guessing
            <span style={highlight}>6 or more cards</span> before losing all 3
            lives. Lose if you run out of lives.
          </li>
          <li>
            <span style={highlight}>Game end:</span> See your final collection
            and statistics, then{" "}
            <span style={highlight}>click "Start a New Game"</span> to play
            again.
          </li>
          <li>
            <span style={highlight}>Game modes:</span> Logged-in users play full
            games with saved history; anonymous users can try a 1-round demo.
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
