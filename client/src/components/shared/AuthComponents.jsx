import { useActionState } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Alert,
  Card,
  Container,
} from "react-bootstrap";
import CustomButton from "./CustomButton";
import { colors } from "../../colors.mjs";

function LoginForm(props) {
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
      await props.handleLogin(credentials);
      return { success: true };
    } catch {
      return { error: "Login failed. Check your credentials." };
    }
  }

  return (
    <Card
      style={{
        borderColor: colors.background.gray_700,
        borderRadius: "22px",
        padding: "20px",
        overflow: "hidden",
        boxShadow: "0 6px 16px " + colors.background.gray_800,
        backgroundColor: colors.background.gray_800,
      }}
    >
      <Form action={formAction}>
        <Form.Group controlId="username" className="mb-4">
          <Form.Label style={{ color: colors.text.light }}>Username</Form.Label>
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
          <Form.Label style={{ color: colors.text.light }}>Password</Form.Label>
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
          }}
        >
          <div>
            User 1: <strong>pirataarrabbiato99</strong> / Password:{" "}
            <strong>password</strong>
          </div>
          <div>
            User 2: <strong>jacksparrow</strong> / Password:{" "}
            <strong>password</strong>
          </div>
        </Form.Text>

        {isPending && (
          <div className="d-flex justify-content-center mb-3">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <Container
          fluid
          className="align-items-center d-flex justify-content-center"
        >
          <CustomButton type="submit" disabled={isPending} label={"Submit"}>
            {isPending ? "Logging in..." : "Login"}
          </CustomButton>
        </Container>
      </Form>
    </Card>
  );
}
export { LoginForm };
