const topicInput = document.getElementById("topicInput");
const createBtn = document.getElementById("createBtn");
const status = document.getElementById("status");

const exampleButtons =
  document.querySelectorAll(".example-btn");


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


async function createQuiz() {

  const topic = topicInput.value.trim();

  if (!topic) {

    status.textContent =
      "দয়া করে একটি বিষয় লিখুন।";

    topicInput.focus();

    return;
  }


  createBtn.disabled = true;

  status.textContent =
    "🤖 AI আপনার Quiz তৈরি করছে...";


  try {

    const response = await fetch(
      "/api/generate-quiz",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          topic: topic
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {
      throw new Error(
        data.error || "Quiz তৈরি করা যায়নি"
      );
    }


    console.log("AI Quiz:", data.quiz);


    status.textContent =
      `✅ ${data.quiz.title} তৈরি হয়েছে!`;

    console.log(
      "Questions:",
      data.quiz.questions
    );


  } catch (error) {

    console.error(error);

    status.textContent =
      "❌ Quiz তৈরি করতে সমস্যা হয়েছে।";

  } finally {

    createBtn.disabled = false;

  }

}
