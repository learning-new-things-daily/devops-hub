document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("devopsQuiz");
  if (!quizForm) return;

  quizForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const answers = {
      q1: "a",
      q2: "b",
      q3: "b"
    };

    let score = 0;
    Object.keys(answers).forEach((key) => {
      const selected = quizForm.querySelector(`input[name="${key}"]:checked`);
      if (selected && selected.value === answers[key]) {
        score++;
      }
    });

    const result = document.getElementById("quizResult");
    result.textContent = `✅ You got ${score} out of ${Object.keys(answers).length} correct!`;
  });
});
