import cors from "cors";
import express from "express";
import questions from "./questions/questions.json" with { type: "json" };
import seedrandom from "seedrandom";

const app = express();

app.use(cors());
app.use(express.json());

// -------------------- SHUFFLE --------------------

function seededShuffle(array, seed) {
  let result = [...array];

  let random = seedrandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// -------------------- EXAM --------------------

app.post("/exam/start", (req, res) => {
  // Create a new random seed for this exam attempt.

  const sessionSeed = `${Date.now()}-${Math.random()}`;

  const shuffled = seededShuffle(questions, sessionSeed);

  res.json({
    questions: shuffled,
  });
});

// -------------------- START SERVER --------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
