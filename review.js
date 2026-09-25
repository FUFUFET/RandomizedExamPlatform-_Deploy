// ------------------------------
// LOAD SAVED STATE
// ------------------------------

const questions = JSON.parse(localStorage.getItem("examQuestions")) || [];
const answers = JSON.parse(localStorage.getItem("examAnswers")) || {};

const reviewContainer = document.getElementById("review-container");
const reviewNav = document.getElementById("review-nav");

// ------------------------------
// RENDER REVIEW CONTENT
// ------------------------------

function renderReview() {
  reviewContainer.innerHTML = "";

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    const wrapper = document.createElement("div");

    const questionText = document.createElement("h2");

    questionText.textContent = `Question ${i + 1}: ${question.question}`;

    wrapper.appendChild(questionText);

    const userAnswer = answers[question.id];

    // question.answer is the index of the correct option.
    // question.options[question.answer] gets the actual answer text.

    const correctAnswer = question.options[question.answer];

    const dl = document.createElement("dl");

    const userDT = document.createElement("dt");

    userDT.textContent = "Your answer:";

    dl.appendChild(userDT);

    const userDD = document.createElement("dd");

    userDD.textContent = userAnswer;

    dl.appendChild(userDD);

    const correctDT = document.createElement("dt");

    correctDT.textContent = "Correct answer:";

    dl.appendChild(correctDT);

    const correctDD = document.createElement("dd");

    correctDD.textContent = correctAnswer;

    dl.appendChild(correctDD);

    wrapper.appendChild(dl);

    // Mark correctness

    const resultP = document.createElement("p");

    if (userAnswer === correctAnswer) {
      resultP.textContent = "✔ Correct";
      resultP.style.color = "rgb(30, 79, 4)";
    } else {
      resultP.textContent = "✘ Incorrect";
      resultP.style.color = "#980000";
    }

    questionText.after(resultP);

    reviewContainer.appendChild(wrapper);
  }
}

// ------------------------------
// RENDER NAV BUTTONS
// ------------------------------

function renderNav() {
  reviewNav.innerHTML = "";

  const retakeBtn = document.createElement("button");

  retakeBtn.type = "button";
  retakeBtn.textContent = "Retake";

  retakeBtn.addEventListener("click", () => {
    localStorage.removeItem("examAnswers");
    localStorage.removeItem("examQuestions");

    window.location.href = "exam.html";
  });

  reviewNav.appendChild(retakeBtn);
}

// ------------------------------
// INIT
// ------------------------------

renderReview();
renderNav();
