const crypto = require("crypto");
const express = require("express");
const path = require("path");
const { createGame, getPublicGame, makeChoice } = require("./game");

const app = express();
const port = process.env.PORT || 3000;
const games = new Map();

app.use(express.json());

app.post("/api/game/start", (request, response) => {
  const gameId = crypto.randomUUID();
  const game = createGame(gameId);

  games.set(gameId, game);

  response.status(201).json(getPublicGame(game));
});

app.get("/api/game/:gameId", (request, response) => {
  const game = games.get(request.params.gameId);

  if (!game) {
    return response.status(404).json({ error: "Game not found." });
  }

  return response.json(getPublicGame(game));
});

app.post("/api/game/:gameId/choose", (request, response) => {
  const game = games.get(request.params.gameId);

  if (!game) {
    return response.status(404).json({ error: "Game not found." });
  }

  try {
    makeChoice(game, request.body.choice);
    return response.json(getPublicGame(game));
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
});

const clientBuildPath = path.join(__dirname, "public");

app.use(express.static(clientBuildPath));

app.get("*", (request, response) => {
  if (request.path.startsWith("/api/")) {
    return response.status(404).json({ error: "Route not found." });
  }

  return response.sendFile(path.join(clientBuildPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Secretary Game is running on http://0.0.0.0:${port}`);
});