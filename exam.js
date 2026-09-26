// ------------------------------
// GLOBAL STATE
// ------------------------------

let questions = [];
let currentIndex = 0;
let answers = JSON.parse(localStorage.getItem("examAnswers")) || {};

const container = document.getElementById("question-container");
const reviewDialog = document.getElementById("review-dialog");
const reviewContainer = document.getElementById("review-container");
const reviewHeading = document.getElementById("review-heading");
const backToExamButton = document.getElementById("back-to-exam");
const submitExamButton = document.getElementById("submit-exam");
let movingToQuestion = false;

reviewHeading.setAttribute("tabindex", "-1");

// ------------------------------
// FETCH QUESTIONS
// ------------------------------

async function loadExam() {
  try {
    const returnToQuestion = localStorage.getItem("returnToQuestion");
    const savedQuestions = localStorage.getItem("examQuestions");

    if (returnToQuestion !== null && savedQuestions) {
      questions = JSON.parse(savedQuestions);
      currentIndex = Number(returnToQuestion);

      localStorage.removeItem("returnToQuestion");
    } else {
      const API = "https://randomizedexamplatform-deploy-1g5u.onrender.com";

      const res = await fetch(`${API}/exam/start`, {
        method: "POST",
      });

      const data = await res.json();

      questions = data.questions;

      localStorage.setItem("examQuestions", JSON.stringify(questions));
    }

    renderQuestion();
    renderNav();
  } catch (err) {
    console.error("Failed to load exam:", err);
  }
}

// ------------------------------
// RENDER QUESTION
// ------------------------------

function renderQuestion(shouldFocusHeading = false) {
  container.innerHTML = "";

  const question = questions[currentIndex];
  const options = question.options;
  const groupName = `q${question.id}`;

  const heading = document.createElement("h1");

  heading.textContent = `Question ${currentIndex + 1} of ${questions.length}`;

  heading.setAttribute("tabindex", "-1");

  container.appendChild(heading);

  const fieldset = document.createElement("fieldset");

  const legend = document.createElement("legend");

  legend.textContent = question.question;

  const instructionText = document.createElement("p");

  instructionText.textContent = "Select one answer to continue.";

  fieldset.appendChild(legend);
  legend.after(instructionText);

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i];

    const label = document.createElement("label");

    const radioButton = document.createElement("input");

    radioButton.type = "radio";
    radioButton.name = groupName;
    radioButton.value = optionText;

    if (answers[question.id] === optionText) {
      radioButton.checked = true;
    }

    radioButton.addEventListener("change", () => {
      saveAnswer(question.id, optionText);
    });

    label.appendChild(radioButton);
    label.appendChild(document.createTextNode(optionText));

    fieldset.appendChild(label);
  }

  container.appendChild(fieldset);

  if (shouldFocusHeading) {
    heading.focus();
  }
}

// ------------------------------
// RENDER NAV
// ------------------------------

function renderNav() {
  const nav = document.getElementById("nav-container");

  nav.innerHTML = "";

  const buttons = [];

  if (currentIndex > 0) {
    buttons.push({
      text: "Previous",

      onClick: () => {
        currentIndex--;

        renderQuestion(true);
        renderNav();
      },
    });
  }

  if (currentIndex < questions.length - 1) {
    buttons.push({
      text: "Next",

      onClick: () => {
        currentIndex++;

        renderQuestion(true);
        renderNav();
      },
    });
  }

  if (currentIndex === questions.length - 1) {
    buttons.push({
      text: "Review",

      onClick: () => {
        openReview();
        reviewHeading.focus();
      },
    });
  }

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];

    const buttonEl = document.createElement("button");

    buttonEl.type = "button";
    buttonEl.textContent = btn.text;

    const isPreviousButton = btn.text === "Previous";

    const currentQuestionId = questions[currentIndex].id;
    const currentAnswer = answers[currentQuestionId];
    const hasAnswer = currentAnswer !== undefined;

    if (!isPreviousButton && !hasAnswer) {
      buttonEl.disabled = true;
    }

    buttonEl.addEventListener("click", btn.onClick);

    nav.appendChild(buttonEl);
  }
}

// ------------------------------
// SAVE ANSWER
// ------------------------------

function saveAnswer(questionId, value) {
  answers[questionId] = value;

  localStorage.setItem("examAnswers", JSON.stringify(answers));

  renderNav();
}

// ------------------------------
// OPEN REVIEW
// ------------------------------

function openReview() {
  const unansweredQuestions = [];

  for (let i = 0; i < questions.length; i++) {
    const questionId = questions[i].id;
    const answer = answers[questionId];

    if (answer === undefined) {
      unansweredQuestions.push(questionId);
    }
  }

  if (unansweredQuestions.length > 0) {
    alert("Please answer all questions before reviewing.");

    return;
  }

  renderReview();

  reviewDialog.showModal();

  setReviewFocusTrap();
}

// ------------------------------
// RENDER REVIEW
// ------------------------------

function renderReview() {
  reviewContainer.innerHTML = "";

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    const wrapper = document.createElement("div");

    const heading = document.createElement("h3");

    heading.textContent = `Question ${i + 1} of ${questions.length}`;

    const questionText = document.createElement("p");

    questionText.textContent = question.question;

    const descriptionList = document.createElement("dl");

    const answerTerm = document.createElement("dt");

    answerTerm.textContent = "Your answer";

    const answerDescription = document.createElement("dd");

    answerDescription.textContent = answers[question.id];

    descriptionList.appendChild(answerTerm);
    descriptionList.appendChild(answerDescription);

    wrapper.appendChild(heading);
    wrapper.appendChild(questionText);
    wrapper.appendChild(descriptionList);

    const questionLink = document.createElement("a");

    questionLink.href = "#";
    questionLink.textContent = `Go to Question ${i + 1}`;

    questionLink.addEventListener("click", (event) => {
      event.preventDefault();

      movingToQuestion = true;

      reviewDialog.close();

      currentIndex = i;

      renderQuestion(true);

      renderNav();
    });

    wrapper.appendChild(questionLink);

    reviewContainer.appendChild(wrapper);
  }
}

// ------------------------------
// FOCUS TRAP
// ------------------------------

function setReviewFocusTrap() {
  const interactiveElements = [];

  const elements = [
    ...reviewDialog.querySelectorAll(
      "button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])",
    ),
  ];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (!element.disabled) {
      interactiveElements.push(element);
    }
  }

  if (interactiveElements.length === 0) {
    return;
  }

  const firstElement = interactiveElements[0];
  const lastElement = interactiveElements[interactiveElements.length - 1];

  firstElement.focus();

  reviewDialog.addEventListener("keydown", handleReviewKeydown);

  function handleReviewKeydown(event) {
    if (event.key !== "Tab") {
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();

        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();

        firstElement.focus();
      }
    }
  }
}

// ------------------------------
// CLOSE REVIEW
// ------------------------------

backToExamButton.addEventListener("click", () => {
  reviewDialog.close();
});

// ------------------------------
// SUBMIT EXAM
// ------------------------------

submitExamButton.addEventListener("click", () => {
  localStorage.setItem("examAnswers", JSON.stringify(answers));

  reviewDialog.close();

  window.location.href = "review.html";
});

// ------------------------------
// RESTORE FOCUS AFTER DIALOG
// ------------------------------

reviewDialog.addEventListener("close", () => {
  if (movingToQuestion) {
    movingToQuestion = false;

    return;
  }

  const reviewButton = document.querySelector(
    "#nav-container button:last-child",
  );

  if (reviewButton) {
    reviewButton.focus();
  }
});

// ------------------------------
// INIT
// ------------------------------

loadExam();
