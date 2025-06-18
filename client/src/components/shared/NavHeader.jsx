import { Col, Container, Nav, Navbar } from "react-bootstrap";
import { useLocation } from "react-router";
import { colors } from "../../colors.mjs";
import CustomButton from "./CustomButton";
import { useContext } from "react";
import UserContext from "../../contexts/userContext";

function NavHeader() {
  const page = useLocation().pathname;

  const { user, handleLogout } = useContext(UserContext);

  return (
    <Navbar
      className="px-2 py-0 m-0"
      sticky="top"
      expand="lg"
      style={{
        backgroundColor: colors.background.accent,
        borderRadius: "9999px",
        border: `0px solid ${colors.border.accentDark}`,
        boxShadow: `0 0px 80px ${colors.border.accentDark}`,
        width: "100%",
        maxWidth: "1800px",
      }}
    >
      <Container
        fluid
        className="d-flex justify-content-between align-items-center px-2 py-0"
        style={{
          width: "100%",
          maxWidth: "1800px",
        }}
      >
        <Col className="d-flex align-items-center nowrap gap-2">
          <Navbar.Brand
            href="/"
            className="navbar-brand"
            style={{
              color: colors.text.dark,
              fontSize: "2rem",
              fontFamily: "'Bangers', cursive",
            }}
          >
            Stuff Happens!
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav
              activeKey={page}
              variant="underline"
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              <Nav.Link href="/">Instructions</Nav.Link>
              {user ? (
                <>
                  <Nav.Link href="/play">Play</Nav.Link>
                  <Nav.Link href="/profile">Profile</Nav.Link>
                </>
              ) : (
                <Nav.Link href="/demo">Demo</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Col>{" "}
        {user ? (
          <Col className="d-flex justify-content-end align-items-center nowrap">
            <Navbar.Text className="me-3">Hi, {user.username}!</Navbar.Text>
            <CustomButton linkTo={"/"} label="Logout" onClick={handleLogout} />
          </Col>
        ) : (
          <Col className="d-flex justify-content-end align-items-center nowrap">
            <CustomButton linkTo={"login"} label="Login" />
          </Col>
        )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
