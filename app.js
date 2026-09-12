const topicInput = document.getElementById("topicInput");
const createBtn = document.getElementById("createBtn");
const status = document.getElementById("status");

const exampleButtons = document.querySelectorAll(".example-btn");

createBtn.addEventListener("click", createQuiz);

topicInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    createQuiz();
  }
});

exampleButtons.forEach(function (button) {

  button.addEventListener("click", function () {

    const topic = button.textContent
      .replace(/^[^\u0980-\u09FF]*\s*/, "")
      .trim();

    topicInput.value = topic;

    topicInput.focus();
  });

});


function createQuiz() {

  const topic = topicInput.value.trim();

  if (!topic) {

    status.textContent =
      "দয়া করে একটি বিষয় লিখুন।";

    topicInput.focus();

    return;
  }

  status.textContent =
    `"${topic}" নিয়ে Quiz তৈরি করা হবে...`;

}
