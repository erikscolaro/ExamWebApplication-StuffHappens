import { Card } from "react-bootstrap";
import { colors } from "../../colors.mjs";
import { useState } from "react";
import config from "../../config/config";

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
function CustomCard({ card, placeholder = false, children }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card
      id={placeholder ? undefined : card.id}
      style={
        placeholder
          ? {
              width: "220px",
              height: "300px",
              backgroundColor: colors.background.transparent,
              borderColor: colors.background.transparent,
            }
          : {
              borderRadius: "22px",
              padding: "10px",
              width: "220px",
              height: "300px",
              overflow: "visible",
              boxShadow: "0px 4px 8px " + colors.background.gray_800,
              backgroundColor: colors.background.gray_800,
              borderColor: colors.background.gray_700,
              marginBottom: "8px",
            }
      }
    >
      {placeholder ? (
        children
      ) : (
        <>
          <Card.Img
            variant="top"            src={
              imageError || !card.imageFilename
                ? `${config.SERVER_URL}/images/default.jpg`
                : `${config.SERVER_URL}/images/${card.imageFilename}`
            }
            onError={handleImageError}
            style={{
              width: "200px",
              height: "200px",
              minHeight: "200px",
              borderRadius: "15px",
              objectFit: "cover",
            }}
          />
          <Card.ImgOverlay
            style={{
              position: "absolute",
              top: 0,
              right: -2,
              padding: "10px",
              display: "flex",
              justifyContent: "end",
              height: "fit-content",
            }}
          >
            <p
              style={{
                color: colors.text.light,
                backgroundColor: colors.background.gray_700,
                fontSize: "18px",
                fontWeight: "bold",
                borderRadius: "0 15px 0 15px",
                padding: "5px 10px",
              }}
            >
              {card.miseryIndex ? card.miseryIndex : "?"}
            </p>
          </Card.ImgOverlay>
          <Card.Body
            style={{
              overflowY: "auto",
              height: "100%",
              margin: "5px 0px 0px 0px",
              padding: "0px 5px 0px 5px",
              color: colors.text.accent,
              fontWeight: "bold",
            }}
          >
            {card.name}
          </Card.Body>
        </>
      )}
    </Card>
  );
}

export default CustomCard;
