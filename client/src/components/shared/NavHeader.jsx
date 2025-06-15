import {
  Button,
  Col,
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Row,
} from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { colors } from "../../colors.mjs";
import CustomButton from "./CustomButton";

function NavHeader(props) {
  let page = useLocation().pathname;

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
          Succede!
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
            <Nav.Link href="/">Istruzioni</Nav.Link>
            {props.loggedIn ? (
              <>
                <Nav.Link href="/play">Gioca</Nav.Link>
                <Nav.Link href="/history">Cronologia</Nav.Link>
              </>
            ) : (
              <Nav.Link href="/demo">Demo</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
        </Col>
        {props.loggedIn ? (
            <Col className="d-flex justify-content-end align-items-center nowrap">
            <Navbar.Text className="me-3">
              Ciao, {props.user.username}!
            </Navbar.Text>
            <CustomButton
              linkTo={"/"}
              label="Esci"
              onClick={props.handleLogout}
            />
            </Col>
        ) : (
          <Col className="d-flex justify-content-end align-items-center nowrap">
          <CustomButton linkTo={"login"} label="Accedi" />
        </Col>
        )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
