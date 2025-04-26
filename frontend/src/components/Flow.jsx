import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

const Flow = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [topic, setTopic] = useState(""); // Added topic state

  useEffect(() => {
    const flowData = localStorage.getItem("flowData");
    if (flowData) {
      const { nodes, edges, topic } = JSON.parse(flowData);

      const reactFlowNodes = nodes.map((node) => ({
        id: node.id.toString(),
        data: { label: node.label },
        position: { x: Math.random() * 500, y: Math.random() * 500 },
      }));

      const reactFlowEdges = edges.map((edge) => ({
        id: `e${edge.source}-${edge.target}`,
        source: edge.source.toString(),
        target: edge.target.toString(),
        label: edge.label,
        animated: true,
        style: { stroke: '#4F46E5' },
      }));

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setTopic(topic); // Set topic here
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <h1 className="text-2xl font-bold text-center mb-4">{topic}</h1> {/* Display topic */}
      <ReactFlow nodes={nodes} edges={edges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default Flow;
