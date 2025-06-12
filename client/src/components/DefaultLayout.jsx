import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";
import { colors } from "../colors.mjs";
import CustomAlert from "./shared/CustomAlert";

function DefaultLayout(props) {
  return (
    <>
      {props.message && props.message.msg && (
        <CustomAlert
          message={props.message}
          setMessage={props.setMessage}
        />
      )}
      <Container
        fluid
        className="d-flex flex-column align-items-center p-4 gap-4"
        style={{
          backgroundColor: colors.background.black,
          height: "100vh",
          width: "100%",
          position: "fixed",
          top: 0,
        }}
      >
        <NavHeader
          loggedIn={props.loggedIn}
          handleLogout={props.handleLogout}
        />
        <Container
          fluid
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: colors.background.gray_900,
            width: "100%",
            height: "100%",
            borderRadius: "20px",
            overflowY: "auto",
            maxWidth: "1800px",
          }}
        >
          <Outlet />
        </Container>
      </Container>
    </>
  );
}

export default DefaultLayout;
