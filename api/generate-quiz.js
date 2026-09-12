export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic } = req.body || {};

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    const schema = {
      type: "object",
      properties: {
        title: {
          type: "string"
        },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: {
                type: "string"
              },
              options: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              correctAnswer: {
                type: "integer"
              },
              hint: {
                type: "string"
              },
              explanation: {
                type: "string"
              }
            },
            required: [
              "question",
              "options",
              "correctAnswer",
              "hint",
              "explanation"
            ]
          }
        }
      },
      required: [
        "title",
        "questions"
      ]
    };

    const prompt = `
তুমি একজন professional quiz creator।

বিষয়:
"${topic}"

এই বিষয়ের উপর ঠিক 9টি MCQ প্রশ্ন তৈরি করো।

প্রতিটি প্রশ্নের জন্য:
- ঠিক 4টি option থাকবে
- শুধুমাত্র 1টি সঠিক উত্তর থাকবে
- correctAnswer হবে 0, 1, 2 অথবা 3
- একটি ছোট hint থাকবে
- সঠিক উত্তরের একটি সহজ explanation থাকবে
- প্রশ্নগুলো তথ্যভিত্তিক এবং পরিষ্কার হবে
- পুরো quiz বাংলায় তৈরি করবে

শুধু JSON schema অনুযায়ী উত্তর দেবে।
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
        encodeURIComponent(process.env.GEMINI_API_KEY),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],

          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(500).json({
        error: "Gemini API request failed"
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned no quiz"
      });
    }

    const quiz = JSON.parse(text);

    if (
      !quiz.questions ||
      quiz.questions.length !== 9
    ) {
      return res.status(500).json({
        error: "Invalid quiz received"
      });
    }

    return res.status(200).json({
      success: true,
      quiz: quiz
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}
