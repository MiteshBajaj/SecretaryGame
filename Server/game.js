const TOTAL_CANDIDATES = 10;

function createRanking() {
  const ranking = Array.from(
    { length: TOTAL_CANDIDATES },
    (_, index) => index + 1
  );

  for (let index = ranking.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [ranking[index], ranking[randomIndex]] = [
      ranking[randomIndex],
      ranking[index]
    ];
  }

  return ranking;
}

function getRelativeInfo(game) {
  const currentIndex = game.currentCandidate - 1;
  const currentQuality = game.ranking[currentIndex];
  const previousCandidates = game.ranking.slice(0, currentIndex);

  return {
    comparedCount: previousCandidates.length,
    betterThan: previousCandidates.filter(
      (quality) => currentQuality > quality
    ).length
  };
}

function getPublicGame(game) {
  const response = {
    gameId: game.id,
    status: game.status,
    currentCandidate: game.currentCandidate,
    candidatesSeen: game.candidatesSeen,
    rejectedCandidates: game.rejectedCandidates,
    selectedCandidate: game.selectedCandidate
  };

  if (game.status === "active") {
    response.relativeInfo = getRelativeInfo(game);
  }

  if (game.status === "finished") {
    const bestCandidate = game.ranking.indexOf(TOTAL_CANDIDATES) + 1;
    const selectedQuality =
      game.selectedCandidate === null
        ? null
        : game.ranking[game.selectedCandidate - 1];

    response.result = {
      selectedCandidate: game.selectedCandidate,
      bestCandidate,
      didSelectBest: selectedQuality === TOTAL_CANDIDATES,
      candidatesEvaluated: game.candidatesSeen,
      ranking: game.ranking.map((quality, index) => ({
        candidateNumber: index + 1,
        quality
      }))
    };
  }

  return response;
}

function createGame(id) {
  return {
    id,
    ranking: createRanking(),
    currentCandidate: 1,
    candidatesSeen: 1,
    rejectedCandidates: [],
    selectedCandidate: null,
    status: "active"
  };
}

function makeChoice(game, choice) {
  if (game.status !== "active") {
    throw new Error("This game has already ended.");
  }

  if (choice !== "accept" && choice !== "reject") {
    throw new Error("Choice must be either accept or reject.");
  }

  if (choice === "accept") {
    game.selectedCandidate = game.currentCandidate;
    game.status = "finished";
    return;
  }

  game.rejectedCandidates.push(game.currentCandidate);

  if (game.currentCandidate === TOTAL_CANDIDATES) {
    game.status = "finished";
    return;
  }

  game.currentCandidate += 1;
  game.candidatesSeen += 1;
}

module.exports = {
  createGame,
  getPublicGame,
  makeChoice
};