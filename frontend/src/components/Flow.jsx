import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import axios from "axios"; // 🚀 added
import StickyNode from "./StickyNode"; // 🚀 custom sticky node

const nodeWidth = 172;
const nodeHeight = 36;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const Flow = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false); // 🚀 loading state

  const applyLayout = useCallback((nodes, edges) => {
    // Initialize the graph and set layout options
    dagreGraph.setGraph({
      rankdir: "TB", // Top to Bottom layout
      nodesep: 20,   // Decrease the space between nodes horizontally (adjust this as needed)
      ranksep: 50,   // Reduce the vertical space between different levels of nodes
      marginx: 10,   // Horizontal margin
      marginy: 10,   // Vertical margin
    });
  
    // Add nodes to the graph
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    // Add edges to the graph to ensure proper connection
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target, { label: edge.label });
    });
  
    // Apply the layout algorithm
    dagre.layout(dagreGraph);
  
    // Adjust node positions after layout to account for the node width and height
    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2, // Adjust for node width
          y: nodeWithPosition.y - nodeHeight / 2, // Adjust for node height
        },
      };
    });
  
    return newNodes;
  }, []);
  

  useEffect(() => {
    const loadFlowData = async () => {
      const flowData = localStorage.getItem("flowData");
      const speechText = localStorage.getItem("speechText");

      console.log("flowData:", flowData);
      console.log("speechText:", speechText);

      if (flowData) {
        const { nodes, edges, topic } = JSON.parse(flowData);

        const reactFlowNodes = nodes.map((node) => ({
          id: node.id.toString(),
          data: { label: node.label },
          position: { x: 0, y: 0 },
        }));

        const reactFlowEdges = edges.map((edge) => ({
          id: `e${edge.source}-${edge.target}`,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label,
          animated: true,
          style: { stroke: '#4F46E5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4F46E5' },
        }));

        const layoutedNodes = applyLayout(reactFlowNodes, reactFlowEdges);

        setNodes(layoutedNodes);
        setEdges(reactFlowEdges);
        setTopic(topic);

        if (speechText) {
          await generateFeedbackAndAddStickyNode(speechText, topic, layoutedNodes, reactFlowEdges);
        }

        await analyzeFlowchartAndSuggest(layoutedNodes, reactFlowEdges, topic); // 🚀 Call new function
      }
    };

    loadFlowData();
  }, [applyLayout]);

  const generateFeedbackAndAddStickyNode = async (text, topic, currentNodes, currentEdges) => {
    try {
      setLoading(true); // show loading
      const response = await axios.post('http://localhost:3000/feedback', { text, topic });
      const { feedback, overview } = response.data;

      const feedbackStickyNode = {
        id: `sticky-feedback-${Date.now()}`,
        type: "sticky",
        position: { x: 800, y: 600 },
        data: {
          title: "Feedback",
          content: feedback, // pass only content here
        },
      };
      
      const overviewStickyNode = {
        id: `sticky-overview-${Date.now()}`,
        type: "sticky",
        position: { x: 1100, y: 600 },
        data: {
          title: "Overview",
          content: overview, // pass only content here
        },
      };
      

      setNodes([feedbackStickyNode, overviewStickyNode, ...currentNodes]);
      setEdges(currentEdges);
    } catch (error) {
      console.error("Failed to fetch feedback/overview:", error);
    } finally {
      setLoading(false); // hide loading
    }
  };

  const analyzeFlowchartAndSuggest = async (nodes, edges, topic) => {
    try {
      const response = await axios.post('http://localhost:3000/analyze-flowchart', {
        nodes,
        edges,
        topic,
      });
  
      const { suggestions } = response.data; // Array of suggestion strings
  
      // Group suggestions into chunks of 4-5 suggestions per sticky note
      const chunkedSuggestions = [];
      const chunkSize = 5; // Set the maximum number of suggestions per sticky node
      for (let i = 0; i < suggestions.length; i += chunkSize) {
        chunkedSuggestions.push(suggestions.slice(i, i + chunkSize));
      }
  
      // Create sticky nodes for each chunk of suggestions
      const suggestionStickyNodes = chunkedSuggestions.map((chunk, index) => {
        const xPosition = 100 + (index % 2) * 400; // Space suggestions horizontally (2 per row)
        const yPosition = 600 + Math.floor(index / 2) * 200; // Space suggestions vertically (next row every 2 chunks)
  
        return {
          id: `sticky-suggestion-${Date.now()}-${index}`,
          type: "sticky",
          position: { x: xPosition, y: yPosition },
          data: { 
            title: `Suggestions Group ${index + 1}`,
            content: chunk.join("\n"), // Join the suggestions in a single string
          },
        };
      });
  
      // Update the nodes state with the new sticky suggestions
      setNodes((prevNodes) => [...suggestionStickyNodes, ...prevNodes]);
    } catch (error) {
      console.error("Failed to analyze flowchart:", error);
    }
  };
  
  
  

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <h1 className="text-2xl font-bold text-center mb-4">{topic}</h1>

      {loading && (
        <div className="text-center text-blue-500 font-semibold mb-2">
          Generating feedback...
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ sticky: StickyNode }}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default Flow;
