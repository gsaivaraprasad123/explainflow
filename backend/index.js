require('dotenv').config(); // make sure dotenv is used
const express = require("express");
const bodyParser = require("body-parser");
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const nlp = winkNLP(model);
const its = nlp.its;
const cors = require('cors')
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors())
const port = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(bodyParser.json());

app.post("/analyze", (req, res) => {
  const { topic, text } = req.body;

  if (!topic || !text) {
    return res.status(400).json({ error: "Both topic and text are required" });
  }

  const doc = nlp.readDoc(text);
  const sentences = doc.sentences();

  let nodes = [];
  let edges = [];
  let nodeId = 1;
  const nodeMap = {};

  sentences.each((s) => {
    let subject = null;
    let verb = null;
    let object = null;

    const tokens = s.tokens().filter((t) => t.out(its.type) === "word");
    tokens.each((token) => {
      const pos = token.out(its.pos);
      const value = token.out(its.normal);

      if (!subject && (pos === "NOUN" || pos === "PRON" || pos === "PROPN")) {
        subject = value;
      } else if (!verb && pos.startsWith("VERB")) {
        verb = value;
      } else if (subject && verb && (pos === "NOUN" || pos === "PROPN")) {
        object = value;
      }
    });

    if (subject && verb && object) {
      if (!nodeMap[subject]) {
        nodeMap[subject] = nodeId++;
        nodes.push({ id: nodeMap[subject], label: subject });
      }
      if (!nodeMap[object]) {
        nodeMap[object] = nodeId++;
        nodes.push({ id: nodeMap[object], label: object });
      }
      edges.push({
        source: nodeMap[subject],
        target: nodeMap[object],
        label: verb,
      });
    }
  });

  res.json({ topic, nodes, edges });
});

app.post('/feedback', async (req, res) => {
  const { text, topic } = req.body;

  if (!text || !topic) {
    return res.status(400).json({ error: "Both text and topic are required." });
  }

  try {
    const flashResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCBglkC8FKGbqyABglb-sboowDfBR2O1Pw',
      {
        contents: [
          {
            parts: [
              {
                text: `
You are an expert educator.
Given the topic "${topic}" and the user's provided text, do the following:
1. If there are any important points or subtopics missing from the user's text, list them in the feedback.
2. Write a clean, short overview of the topic covering everything important.
3. DO NOT include any other information like explanations or additional details. Only provide the feedback and overview.

Respond ONLY in raw JSON format, with no markdown or explanations.

Format:
{
  "feedback": ["point 1", "point 2", "point 3"],
  "overview": "overview text here"
}

User's Provided Text:
${text}
                `.trim()
              }
            ]
          }
        ]
      }
    );

    let rawText = flashResponse.data.candidates[0].content.parts[0].text.trim();

    // Remove surrounding Markdown code block if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```json\s*|^```\s*|```$/g, '');
    }

    const parsed = JSON.parse(rawText);
    res.json({ feedback: parsed.feedback, overview: parsed.overview });
  } catch (error) {
    console.error('Flash Feedback Error:', error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate feedback/overview." });
  }
});

app.post('/analyze-flowchart', async (req, res) => {
  const { nodes, edges, topic } = req.body;

  try {
    // 1. Format nodes and edges nicely
    const formattedFlow = nodes.map((n, idx) => `${idx + 1}. ${n.data.label}`).join('\n');

    // 2. Create the prompt for Gemini
    const prompt = `
      Analyze the following flowchart based on the topic: "${topic}".
      Steps:
      ${formattedFlow}

      Please suggest improvements:
      - Highlight if steps are missing.
      - Identify disconnected or isolated steps.
      - Recommend if more clarity, ordering, or branching is needed.
      - Point out any common mistakes or missing best practices based on the topic.

      Be concise but specific.
    `;

    // 3. Send to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let suggestions = response.text().trim();

    // 4. Ensure suggestions are returned as an array for further processing
    if (typeof suggestions === 'string') {
      suggestions = suggestions.split('\n').map((suggestion) => suggestion.trim()).filter(Boolean);
    }

    // 5. If suggestions is not an array, respond with a default error message
    if (!Array.isArray(suggestions)) {
      return res.status(500).json({ error: "Failed to analyze flowchart. Suggestions are not in the expected format." });
    }

    // 6. Return AI suggestions
    res.json({ suggestions });
  } catch (error) {
    console.error("Gemini Analysis Error:", error.message);
    res.status(500).json({ message: "Error analyzing flowchart" });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
