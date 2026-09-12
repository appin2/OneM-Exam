 export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic } = req.body || {};

    if (!topic) {
      return res.status(400).json({
        error: "Topic is required"
      });
    }

    const prompt = `
তুমি একজন বাংলা Quiz তৈরি করার AI।

বিষয়: ${topic}

ঠিক 9টি MCQ প্রশ্ন তৈরি করো।

প্রতিটি প্রশ্নে:
- question থাকবে
- 4টি options থাকবে
- correctAnswer হবে 0, 1, 2 অথবা 3
- hint থাকবে
- explanation থাকবে

সবকিছু বাংলায় লিখবে।
শুধু JSON output দেবে।
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
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

            responseSchema: {
              type: "OBJECT",

              properties: {
                title: {
                  type: "STRING"
                },

                questions: {
                  type: "ARRAY",

                  items: {
                    type: "OBJECT",

                    properties: {
                      question: {
                        type: "STRING"
                      },

                      options: {
                        type: "ARRAY",
                        items: {
                          type: "STRING"
                        }
                      },

                      correctAnswer: {
                        type: "INTEGER"
                      },

                      hint: {
                        type: "STRING"
                      },

                      explanation: {
                        type: "STRING"
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
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);

      return res.status(500).json({
        error: "Gemini API Error",
        details: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned empty response"
      });
    }

    const quiz = JSON.parse(text);

    return res.status(200).json({
      success: true,
      quiz: quiz
    });

  } catch (error) {

    console.error("Server Error:", error);

    return res.status(500).json({
      error: error.message
    });
  }
 }
