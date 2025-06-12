import { Button, Container, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import { colors } from "../colors.mjs";
import CustomButton from "./shared/CustomButton";

function NavHeader(props) {
  return (
    <Navbar
      className="px-2 py-0 m-0"
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
        className="d-flex justify-content-between align-items-center"
      >
        <Link
          to="/"
          className="navbar-brand"
          style={{
            color: colors.text.dark,
            fontSize: "2rem",
            fontFamily: "'Bangers', cursive",
          }}
        >
          Shit Happens
        </Link>

        {props.loggedIn ? (
          <CustomButton
            linkTo={""}
            label="Logout"
            onClick={props.handleLogout}
          />
        ) : (
          <CustomButton linkTo={"login"} label="Login" />
        )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
