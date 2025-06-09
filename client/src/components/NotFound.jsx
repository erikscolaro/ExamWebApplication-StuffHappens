import { Container, Row, Col, Alert } from "react-bootstrap";
import { Link } from "react-router";

/**
 * NotFound component for handling 404 errors
 */
function NotFound() {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <Alert variant="warning">
            <Alert.Heading>404 - Page Not Found</Alert.Heading>
            <p>
              The page you are looking for doesn't exist. 
              You may have mistyped the address or the page may have moved.
            </p>
            <hr />
            <div className="mb-0">
              <Link to="/" className="btn btn-primary">
                Go Home
              </Link>
            </div>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFound;
