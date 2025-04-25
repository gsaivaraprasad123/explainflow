const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const nlp = winkNLP(model);
const its = nlp.its;

// Sample input
const input = "Plants take sunlight. They perform photosynthesis.";
const doc = nlp.readDoc(input);

const result = [];

doc.sentences().each((sentence) => {
  const tokens = sentence
    .tokens()
    .filter((token) => token.out(its.type) === "word");

  let from = null;
  let action = null;
  let to = null;

  tokens.each((token) => {
    const pos = token.out(its.pos);
    const word = token.out(its.normal);

    if (!from && (pos === "NOUN" || pos === "PRON")) {
      from = word;
    } else if (!action && pos.startsWith("VERB")) {
      action = word;
    } else if (from && action && (pos === "NOUN" || pos === "PROPN")) {
      to = word;
    }
  });

  if (from && action && to) {
    result.push({ from, action, to });
  }
});

console.log(result);

///////////////////////////////

// const express = require("express");
// const bodyParser = require("body-parser");
// const winkNLP = require("wink-nlp");
// const model = require("wink-eng-lite-web-model");
// const nlp = winkNLP(model);
// const its = nlp.its;

// const app = express();
// const port = 3000;

// // Use bodyParser middleware to parse JSON requests
// app.use(bodyParser.json());

// // /analyze POST endpoint to process input text and generate flowchart data
// app.post("/analyze", (req, res) => {
//   const inputText = req.body.text;

//   if (!inputText) {
//     return res.status(400).json({ error: "No input text provided" });
//   }

//   // Process the input text using winkNLP
//   const doc = nlp.readDoc(inputText);

//   let nodes = [];
//   let edges = [];
//   let nodeId = 1; // To keep track of unique node IDs

//   // A map to track nodes by their label
//   const nodeMap = {};

//   doc.sentences().each((sentence) => {
//     const tokens = sentence
//       .tokens()
//       .filter((token) => token.out(its.type) === "word");

//     let from = null;
//     let action = null;
//     let to = null;

//     tokens.each((token) => {
//       const pos = token.out(its.pos);
//       const word = token.out(its.normal);

//       if (!from && (pos === "NOUN" || pos === "PRON")) {
//         from = word;
//       } else if (!action && pos.startsWith("VERB")) {
//         action = word;
//       } else if (from && action && (pos === "NOUN" || pos === "PROPN")) {
//         to = word;
//       }
//     });

//     if (from && action && to) {
//       // Add nodes and edges for the SVO triplet
//       if (!nodeMap[from]) {
//         nodeMap[from] = nodeId++;
//         nodes.push({ id: nodeMap[from], label: from });
//       }

//       if (!nodeMap[to]) {
//         nodeMap[to] = nodeId++;
//         nodes.push({ id: nodeMap[to], label: to });
//       }

//       // Create an edge between from -> action -> to
//       edges.push({
//         source: nodeMap[from],
//         target: nodeMap[to],
//         label: action,
//       });
//     }
//   });

//   // Send back the graph data (nodes and edges)
//   res.json({ nodes, edges });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
