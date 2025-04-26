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
    dagreGraph.setGraph({ rankdir: "TB" });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
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
        position: { x: 1200, y: 50 },
        data: {
          title: "Feedback",
          content: feedback, // pass only content here
        },
      };
      
      const overviewStickyNode = {
        id: `sticky-overview-${Date.now()}`,
        type: "sticky",
        position: { x: 1400, y: 50 },
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
