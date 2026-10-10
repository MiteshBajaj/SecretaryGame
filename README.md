# Secretary Game

An interactive implementation of the classic Secretary Problem, also called the optimal stopping problem.

The player reviews ten candidates in sequence. A candidate's true quality is hidden until the game ends; the player only sees how the current candidate compares with previous candidates.

## How it works

- Each game creates a random ordering of ten hidden candidate qualities.
- You see candidates one at a time.
- You can accept one candidate or reject them and continue.
- Rejected candidates cannot return.
- At the end, the complete ranking is revealed.

The backend owns the game state and never sends absolute rankings until a game is complete.

## Tech stack

- React and Vite
- Node.js and Express
- In-memory `Map` for game sessions
- Docker
- GitHub Actions build validation

## Local development

Install dependencies:

```bash
cd server
npm install

cd ../client
npm install