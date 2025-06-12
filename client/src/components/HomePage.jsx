import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { colors } from "../colors.mjs";

/**
 * HomePage component that serves as the main landing page
 * Shows different content based on user authentication status
 */
function HomePage() {
  return (
    <>
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card
              style={{
                borderColor: colors.background.gray_700,
                borderRadius: "22px",
                padding: "20px",
                backgroundColor: colors.background.gray_800,
              }}
            >
              <Card.Body>
                <Card.Title className="text-center" style={{ color: colors.text.white }}>
                  Welcome to the Game!
                </Card.Title>
                <Card.Text className="text-center" style={{ color: colors.text.lightGray }}>
                  This is the home page of our game. Please log in to start playing.
                </Card.Text>
                <div className="text-center">
                  <Button variant="primary" href="/login">Login</Button>
                  <Button variant="secondary" href="/register" className="ml-2">Register</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default HomePage;
