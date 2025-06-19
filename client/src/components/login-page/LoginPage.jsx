import { useActionState, useContext } from "react";
import { Form, Card, Container } from "react-bootstrap";
import CustomSpinner from "../shared/CustomSpinner.jsx";
import CustomButton from "../shared/CustomButton";
import { colors } from "../../colors.mjs";
import UserContext from "../../contexts/UserContext.js";

export default function LoginPage() {
  const { handleLogin, isLoading } = useContext(UserContext);
  const { setMessage } = useContext(UserContext);

  const [state, formAction, isPending] = useActionState(loginFunction, {
    username: "",
    password: "",
  });

  async function loginFunction(_prevState, formData) {
    const credentials = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
    try {
      await handleLogin(credentials);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      setMessage({
        msg: "User or password is incorrect. Try again.",
        type: "warning",
      });
    }
  }
  if (isPending || isLoading) {
    return <CustomSpinner />;
  }

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <Card
        style={{
          borderColor: colors.background.gray_700,
          borderRadius: "22px",
          padding: "20px",
          overflow: "hidden",
          width: "400px",
          height: "fit-content",
          boxShadow: "0 6px 16px " + colors.background.gray_800,
          backgroundColor: colors.background.gray_800,
        }}
      >
        <Form action={formAction}>
          <Form.Group controlId="username" className="mb-4">
            <Form.Label style={{ color: colors.text.light }}>
              Username
            </Form.Label>
            <Form.Control
              type="text"
              name="username"
              required
              style={{
                backgroundColor: colors.background.gray_700,
                borderColor: colors.border.transparent,
                color: colors.text.light,
              }}
            />
          </Form.Group>
          <Form.Group controlId="password" className="mb-4">
            <Form.Label style={{ color: colors.text.light }}>
              Password
            </Form.Label>
            <Form.Control
              type="password"
              name="password"
              required
              style={{
                backgroundColor: colors.background.gray_700,
                borderColor: colors.border.transparent,
                color: colors.text.light,
              }}
            />
          </Form.Group>
          {state.error && (
            <p className="text-danger text-center">{state.error}</p>
          )}
          <Form.Text
            className="mb-3 text-left d-block"
            style={{
              color: colors.text.light,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            <div>
              User 1: <strong>progamer</strong> / Password:
              <strong>password</strong>
            </div>
            <div>
              User 2: <strong>noobplayer</strong> / Password:
              <strong>password</strong>
            </div>
          </Form.Text>
          <Container
            fluid
            className="align-items-center d-flex justify-content-center"
          >
            <CustomButton type="submit" disabled={isPending} label={"Submit"}>
              Login
            </CustomButton>
          </Container>
        </Form>
      </Card>
    </Container>
  );
}
