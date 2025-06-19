import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./shared/NavHeader";
import { colors } from "../colors.mjs";
import CustomAlert from "./shared/CustomAlert";
import { useContext } from "react";
import ErrorContext from "../contexts/ErrorContext";

function DefaultLayout() {
  const alertInfo = useContext(ErrorContext);
  return (
    <>
      {alertInfo.message && alertInfo.message.msg && (
        <CustomAlert
          message={alertInfo.message}
          setMessage={alertInfo.setMessage}
        />
      )}
      <Container
        fluid
        className="d-flex flex-column align-items-center p-3 gap-3"
        style={{
          backgroundColor: colors.background.black,
          height: "100vh",
          width: "100%",
          position: "fixed",
          top: 0,
        }}
      >
        <NavHeader />
        <Container
          fluid
          className="d-flex flex-column align-items-center p-2 pt-3"
          style={{
            backgroundColor: colors.background.gray_900,
            width: "100%",
            minHeight: "calc(100vh - 120px)",
            borderRadius: "20px",
            overflowY: "auto",
            maxWidth: "1800px",
            scrollbarWidth: "thin",
            scrollbarColor: `${colors.background.accentTransparent} transparent`,
          }}
        >
          <Outlet />
          {}
        </Container>
      </Container>
    </>
  );
}

export default DefaultLayout;
