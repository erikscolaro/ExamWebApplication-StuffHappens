import { Container } from "react-bootstrap";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { colors } from "../../colors.mjs";

export default function CountdownTimer({ resetKey, isPlaying, onComplete }) {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center"
      style={{
        border: `1px solid ${colors.background.gray_700}`,
        width: "fit-content",
        height: "fit-content",
        padding: "20px",
        borderRadius: "40px",
        boxShadow: "0 0 20px " + colors.background.gray_800,
        backgroundColor: colors.background.gray_800,
      }}
    >
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={30}
        key={resetKey}
        onComplete={onComplete}
        colors={colors.background.accent}
        size={175}
        strokeWidth={8}
        updateInterval={0.05}
        trailStrokeWidth={1}
        trailColor={colors.background.gray_700}
      >
        {({ remainingTime }) => (
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.5rem",
              color: colors.text.light,
            }}
          >
            {remainingTime} s
          </div>
        )}
      </CountdownCircleTimer>
    </Container>
  );
}
