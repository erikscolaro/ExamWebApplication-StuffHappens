import { Modal } from "react-bootstrap";
import { colors } from "../../colors.mjs";

export default function CustomModal({
  show,
  title,
  body,
  footer,
  isBlocking = true,
  onHide,
}) {
  const style = {
    background: colors.background.gray_800,
    color: colors.text.light,
    border: `1px solid ${colors.background.gray_700}`,
  };

  return (
    <Modal
      show={show}
      onHide={isBlocking ? () => {} : onHide}
      centered
      backdrop={isBlocking ? "static" : true}
      keyboard={!isBlocking}
      style={{
        backgroundColor: colors.background.darkTransparent,
      }}
    >
      {title && (
        <Modal.Header style={style} closeButton={!isBlocking}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      {body && <Modal.Body style={style}>{body}</Modal.Body>}
      {footer && <Modal.Footer style={style}>{footer}</Modal.Footer>}
    </Modal>
  );
}
