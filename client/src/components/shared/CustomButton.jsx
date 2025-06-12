import { Button } from "react-bootstrap";
import { Link } from "react-router";
import { colors } from "../../colors.mjs";

export default function CustomButton({ 
  label, 
  linkTo, 
  submit, 
  variant = "outline-light",
  style,
  onMouseEnter,
  onMouseLeave,
  ...otherProps 
}) {
  // Default style that can be overridden
  const defaultStyle = {
    borderRadius: "9999px",
    border: `0px solid ${colors.border.dark}`,
    boxShadow: `0 0 8px ${colors.background.gray_800}`,
    color: colors.text.dark,
    backgroundColor: colors.background.accent,
    transition: "all 0.3s ease",
    fontWeight: "bold",
    ...style, // User style overrides defaults
  };

  // Default mouse handlers that can be overridden
  const defaultOnMouseEnter = (e) => {
    e.target.style.backgroundColor = colors.background.accentDark;
    e.target.style.boxShadow = `0 0 16px ${colors.background.gray_700}`;
  };

  const defaultOnMouseLeave = (e) => {
    e.target.style.backgroundColor = colors.background.accent;
    e.target.style.boxShadow = `0 0 8px ${colors.background.gray_700}`;
  };

  return (
    <Button
      variant={variant}
      style={defaultStyle}
      onMouseEnter={onMouseEnter || defaultOnMouseEnter}
      onMouseLeave={onMouseLeave || defaultOnMouseLeave}
      as={linkTo ? Link : undefined}
      to={linkTo}
      type={linkTo ? undefined : (submit ? "submit" : "button")}
      {...otherProps}
    >
      {label}
    </Button>
  );
}