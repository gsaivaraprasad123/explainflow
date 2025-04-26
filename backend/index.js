const express = require("express");
const bodyParser = require("body-parser");
const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const nlp = winkNLP(model);
const its = nlp.its;
const cors = require('cors')

const app = express();
app.use(cors())
const port = 3000;

app.use(bodyParser.json());

app.post("/analyze", (req, res) => {
  const inputText = req.body.text;
  if (!inputText)
    return res.status(400).json({ error: "No input text provided" });

  const doc = nlp.readDoc(inputText);
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

  res.json({ nodes, edges });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
