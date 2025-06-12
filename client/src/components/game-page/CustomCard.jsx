import { Card } from "react-bootstrap";
import { colors } from "../../colors.mjs";

/**
 * CustomCard component renders a styled card displaying game card information
 * 
 * @component
 * @param {Object} props - The component props
 * @param {Object} props.card - The card object to display
 * @param {string|number} props.card.id - Unique identifier for the card
 * @param {string|number} props.card.miseryIndex - The misery index value displayed on the card
 * @param {string} props.card.name - The name of the card displayed in the body
 * @param {string|undefined} [props.card.imageFilename] - The filename of the card image, defaults to a placeholder if not provided
 * @returns {JSX.Element} A styled React Bootstrap Card component with image, overlay, and body content
 * 
 * @example
 * const cardData = {
 *   id: 1,
 *   miseryIndex: 85,
 *   name: "Card Name"
 * };
 * 
 * <CustomCard card={cardData} />
 */
function CustomCard({card }) {
  return (
    <Card
      id={card.id}
      style={{
        borderColor: colors.background.gray_700,
        borderRadius: "22px",
        padding: "10px",
        width: "220px",
        height: "300px",
        overflow: "hidden",
        boxShadow: "0 6px 16px " + colors.background.gray_800,
        backgroundColor: colors.background.gray_800,
      }}
    >
      <Card.Img
        variant="top"
        src={card.imageFilename ? `${card.imageFilename}` : "default.png"}
        style={{
          maxWidth: "200px",
          height: "200px",
          borderRadius: "15px",
        }}
      />
      <Card.ImgOverlay
        style={{
          position: "absolute",
          padding: "10px",
          textAlign: "center",
          fontSize: "18px", // Imposta la dimensione del testo,
          justifyContent: "flex-end",
          display: "flex",
          height: "fit-content",
        }}
      >
        <p
          style={{
            color: colors.background.gray_900,
            backgroundColor: colors.background.gray_200,
            fontWeight: "bold",
            borderRadius: "0px 15px 0px 15px",
            width: "fit-content",
            padding: "5px 15px",
          }}
        >
          {card.miseryIndex ? card.miseryIndex : "?"}
        </p>
      </Card.ImgOverlay>

      <Card.Body
        style={{
          overflowY: "auto",
          height: "100%",
          margin: "10px 0px 5px 0px",
          padding: "0px 5px 0px 5px",
        }}
      >
        <p style={{ color: colors.text.accent, fontWeight: "bold" }}>
          {card.name}
        </p>
      </Card.Body>
    </Card>
  );
}

export default CustomCard;
