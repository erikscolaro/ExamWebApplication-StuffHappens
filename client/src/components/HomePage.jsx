import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router";

/**
 * HomePage component that serves as the main landing page
 * Shows different content based on user authentication status
 */
function HomePage({ loggedIn }) {
  return (
    <Container>
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-3">🃏 Welcome to Gioco Sfortuna!</h1>
          <p className="lead">
            A card game where you sort cards by their misery index. 
            Can you handle the challenge?
          </p>
        </Col>
      </Row>

      <Row className="justify-content-center">
        {loggedIn ? (
          // Logged in user options
          <>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title>🎮 Start New Game</Card.Title>
                  <Card.Text>
                    Start a new full game with 3 rounds. 
                    Your progress will be saved!
                  </Card.Text>
                  <Link to="/games/new">
                    <Button variant="primary">New Game</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title>📊 Game History</Card.Title>
                  <Card.Text>
                    View your previous games and see how you performed.
                  </Card.Text>
                  <Link to="/games">
                    <Button variant="info">View History</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title>🎯 Try Demo</Card.Title>
                  <Card.Text>
                    Practice with a quick demo game. No registration required!
                  </Card.Text>
                  <Link to="/demo">
                    <Button variant="secondary">Play Demo</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </>
        ) : (
          // Guest user options
          <>
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title>🎯 Try Demo Game</Card.Title>
                  <Card.Text>
                    Get a taste of the game with our quick demo. 
                    No registration required - just jump in and play!
                  </Card.Text>
                  <Link to="/demo">
                    <Button variant="primary" size="lg">Play Demo</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6} className="mb-3">
              <Card className="h-100">
                <Card.Body className="text-center">
                  <Card.Title>🔐 Login for Full Experience</Card.Title>
                  <Card.Text>
                    Create an account to play the full game with 3 rounds, 
                    save your progress, and track your game history.
                  </Card.Text>
                  <Link to="/login">
                    <Button variant="success" size="lg">Login</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* How to Play Section */}
      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h3>🎲 How to Play</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <h5>1. 📋 View Cards</h5>
                  <p>You'll be shown a set of cards one by one during each round.</p>
                </Col>
                <Col md={4}>
                  <h5>2. 🔢 Sort by Misery</h5>
                  <p>Arrange the cards in order from lowest to highest misery index.</p>
                </Col>
                <Col md={4}>
                  <h5>3. ⏰ Beat the Clock</h5>
                  <p>You have limited time to submit your answer for each round!</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
