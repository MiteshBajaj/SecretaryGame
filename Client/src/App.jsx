import { useEffect, useState } from "react";

const TOTAL_CANDIDATES = 10;

function formatCandidate(number) {
  return String(number).padStart(2, "0");
}

function Progress({ currentCandidate, isFinished }) {
  return (
    <ol className="progress" aria-label="Candidate progress">
      {Array.from({ length: TOTAL_CANDIDATES }, (_, index) => {
        const candidate = index + 1;
        const isCurrent = candidate === currentCandidate && !isFinished;
        const isPast = candidate < currentCandidate || isFinished;

        return (
          <li
            className={[
              "progress__step",
              isCurrent ? "progress__step--current" : "",
              isPast ? "progress__step--past" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            key={candidate}
          >
            {formatCandidate(candidate)}
          </li>
        );
      })}
    </ol>
  );
}

function GameCard({ game, onChoose, isLoading }) {
  const { currentCandidate, relativeInfo } = game;
  const isFirstCandidate = relativeInfo.comparedCount === 0;

  return (
    <section className="game-card" aria-live="polite">
      <div className="game-card__topline">
        <span>Current decision</span>
        <span>One choice only</span>
      </div>

      <div className="candidate-number">
        <span>Candidate</span>
        <strong>{formatCandidate(currentCandidate)}</strong>
        <span>/ {TOTAL_CANDIDATES}</span>
      </div>

      <div className="candidate-insight">
        <p className="candidate-insight__label">Relative standing</p>
        <p className="candidate-insight__value">
          {isFirstCandidate
            ? "The first candidate sets your initial benchmark."
            : `Better than ${relativeInfo.betterThan} of the ${relativeInfo.comparedCount} candidates you've seen.`}
        </p>
      </div>

      <div className="decision-note">
        <span>Remember</span>
        <p>Rejected candidates cannot be selected later.</p>
      </div>

      <div className="actions">
        <button
          className="button button--secondary"
          disabled={isLoading}
          onClick={() => onChoose("reject")}
          type="button"
        >
          Reject
        </button>
        <button
          className="button button--primary"
          disabled={isLoading}
          onClick={() => onChoose("accept")}
          type="button"
        >
          Accept
        </button>
      </div>
    </section>
  );
}

function ResultCard({ game, onRestart, isLoading }) {
  const { result } = game;
  const hasSelection = result.selectedCandidate !== null;
  const decision = result.didSelectBest ? "Success" : "Missed";

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-card__heading">
        <span className="eyebrow">Result</span>
        <h2>
          {result.didSelectBest
            ? "You found the best candidate."
            : hasSelection
              ? "The best candidate got away."
              : "No candidate was selected."}
        </h2>
        <p>
          {hasSelection
            ? `You selected Candidate ${formatCandidate(result.selectedCandidate)}.`
            : "You rejected all ten candidates."}
        </p>
      </div>

      <div className="result-summary">
        <div>
          <span>Your selection</span>
          <strong>
            {hasSelection
              ? `Candidate ${formatCandidate(result.selectedCandidate)}`
              : "No selection"}
          </strong>
        </div>
        <div>
          <span>Best candidate</span>
          <strong>Candidate {formatCandidate(result.bestCandidate)}</strong>
        </div>
        <div>
          <span>Candidates evaluated</span>
          <strong>{result.candidatesEvaluated} of 10</strong>
        </div>
        <div>
          <span>Decision</span>
          <strong className={result.didSelectBest ? "success" : "missed"}>
            {decision}
          </strong>
        </div>
      </div>

      <div className="ranking">
        <div className="ranking__header">
          <div>
            <span className="eyebrow">Full reveal</span>
            <h3>Candidate ranking</h3>
          </div>
          <p>10 is the strongest candidate.</p>
        </div>

        <div className="ranking__list">
          {result.ranking.map((candidate) => (
            <div className="ranking__item" key={candidate.candidateNumber}>
              <span>Candidate {formatCandidate(candidate.candidateNumber)}</span>
              <div className="ranking__meter" aria-hidden="true">
                <span style={{ width: `${candidate.quality * 10}%` }} />
              </div>
              <strong>{candidate.quality}/10</strong>
            </div>
          ))}
        </div>
      </div>

      <button
        className="button button--primary button--restart"
        disabled={isLoading}
        onClick={onRestart}
        type="button"
      >
        Play again
      </button>
    </section>
  );
}

function App() {
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function request(path, options = {}) {
    const response = await fetch(path, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
  }

  async function startGame() {
    setIsLoading(true);
    setError("");

    try {
      const nextGame = await request("/api/game/start", { method: "POST" });
      setGame(nextGame);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function chooseCandidate(choice) {
    if (!game || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const nextGame = await request(`/api/game/${game.gameId}/choose`, {
        method: "POST",
        body: JSON.stringify({ choice })
      });

      setGame(nextGame);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startGame();
  }, []);

  const isFinished = game?.status === "finished";

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div>
            <p className="product-mark">Secretary Game</p>
            <h1>Optimal stopping, made interactive.</h1>
          </div>
          <span className="session-status">
            {isFinished ? "Session complete" : "Live session"}
          </span>
        </header>

        <section className="intro">
          <p>
            Evaluate each candidate using only how they compare to those already
            seen. Decide when to stop before the stronger options disappear.
          </p>
        </section>

        {error && (
          <div className="error-message" role="alert">
            {error}
            <button onClick={startGame} type="button">
              Try again
            </button>
          </div>
        )}

        {!game && !error && (
          <section className="loading-state">
            <span />
            Starting a new session…
          </section>
        )}

        {game && (
          <>
            <Progress
              currentCandidate={game.currentCandidate}
              isFinished={isFinished}
            />

            {isFinished ? (
              <ResultCard
                game={game}
                isLoading={isLoading}
                onRestart={startGame}
              />
            ) : (
              <GameCard
                game={game}
                isLoading={isLoading}
                onChoose={chooseCandidate}
              />
            )}
          </>
        )}

        <section className="how-it-works">
          <div>
            <p className="eyebrow">How it works</p>
            <h2>A decision with no undo.</h2>
          </div>
          <div className="how-it-works__copy">
            <p>
              Candidates arrive one at a time, and every rejection is permanent.
              The challenge is knowing when a strong relative result is strong
              enough to accept.
            </p>
            <p>
              This is an optimal stopping problem. The classic strategy observes
              an initial group, then selects the next candidate better than every
              candidate observed so far.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;