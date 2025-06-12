import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { colors } from "../colors.mjs";

/**
 * HomePage component that serves as the main landing page
 * Shows different content based on user authentication status
 */
function HomePage() {
  const highlight = {
    color: colors.text.accent,
    fontWeight: "bold",
  };

  return (
    <Container fluid className="p-3 d-flex flex-column align-items-center justify-content-center">
      <h2
        style={{
          textAlign: "center",
          fontSize: "2rem",
          marginBottom: 20,
          color: colors.text.accent,
          fontWeight: "700",
        }}
      >
        Regole del gioco
      </h2>
      <ol style={{ lineHeight: 1.6, color: colors.text.light }}>
        <li>
          Parti con <span style={highlight}>3 carte</span>, rappresentanti
          situazioni orribili ordinate per sfortuna (da 1.0 a 100.0).
        </li>
        <li>
          Ad ogni round ti viene mostrata{" "}
          <span style={highlight}>una nuova situazione</span> con una
          descrizione e una immagine, ma senza indice di sfortuna.
        </li>
        <li>
          Devi indovinare <span style={highlight}>dove si colloca</span>{" "}
          rispetto alle carte che hai.
        </li>
        <li>
          Hai <span style={highlight}>30 secondi</span> per rispondere:
          <ul>
            <li>
              Se indovini, la carta si aggiunge alla tua collezione e ne vedrai
              i dettagli.
            </li>
            <li>Se invece non indovini o scade il tempo, perdi la carta!</li>
          </ul>
        </li>
        <li>
          <span style={highlight}>Vinci</span> se indovini tutti i round e
          finisci con 6 carte, <span style={highlight}>perdi</span> altrimenti.
        </li>
        <li>Alla fine vedai un riepilogo e puoi iniziare una nuova partita.</li>
        <li>
          Se sei loggato, puoi fare una partita completa di 3 round con
          cronologia salvata; se anonimo, solo una partita demo di 1 round.
        </li>
      </ol>
    </Container>
  );
}

export default HomePage;
