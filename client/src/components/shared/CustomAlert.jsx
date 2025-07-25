import { Alert, Container } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import { useEffect } from "react";

function CustomAlert({ message, setMessage }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000); // 3 secondi

    return () => clearTimeout(timer); // cleanup se il componente si smonta
  }, [setMessage]);

  const messageConfig = {
    danger: { icon: "bi-exclamation-triangle", variant: "danger" },
    error: { icon: "bi-exclamation-triangle", variant: "danger" },
    warning: { icon: "bi-exclamation-circle", variant: "warning" },
    success: { icon: "bi-check-circle", variant: "success" },
    info: { icon: "bi-info-circle", variant: "info" },
  };

  const config = messageConfig[message.type] || messageConfig.info;

  return (
    <>
      {message ? (
        <Container
          fluid
          className="d-flex justify-content-center align-items-end"
          style={{
            position: "fixed",
            bottom: "20px",
            left: 0,
            right: 0,
            zIndex: 9999,
            height: "auto",
            pointerEvents: "none",
            padding: 0,
          }}
        >
          <Alert
            variant={config.variant}
            onClose={() => setMessage(null)}
            dismissible
            style={{
              borderRadius: "9999px",
              borderColor: colors.border.accentDark,
              backgroundColor: colors.background.accentDarkTransparent,
              color: colors.text.accent,
              width: "fit-content",
              pointerEvents: "auto",
            }}
          >
            <i
              className={`bi ${config.icon} me-3`}
              style={{ fontSize: "1rem" }}
            ></i>
            {message.msg}
          </Alert>
        </Container>
      ) : null}
    </>
  );
}

export default CustomAlert;
