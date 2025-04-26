import React, { useEffect, useState, useCallback } from "react";

import ReactFlow, { Background, Controls, MiniMap, MarkerType } from "reactflow";

import "reactflow/dist/style.css";

import dagre from "dagre";



const nodeWidth = 172;

const nodeHeight = 36;



const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));



const Flow = () => {

 const [nodes, setNodes] = useState([]);

 const [edges, setEdges] = useState([]);

 const [topic, setTopic] = useState("");



 const applyLayout = useCallback((nodes, edges) => {

  dagreGraph.setGraph({ rankdir: "TB" }); // Top -> Bottom



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

  const flowData = localStorage.getItem("flowData");

  if (flowData) {

   const { nodes, edges, topic } = JSON.parse(flowData);



   const reactFlowNodes = nodes.map((node) => ({

    id: node.id.toString(),

    data: { label: node.label },

    position: { x: 0, y: 0 }, // position will be arranged by dagre

   }));



   const reactFlowEdges = edges.map((edge) => ({

    id: `e${edge.source}-${edge.target}`,

    source: edge.source.toString(),

    target: edge.target.toString(),

    label: edge.label,

    animated: true,

    style: { stroke: '#4F46E5' },

    markerEnd: {

     type: MarkerType.ArrowClosed,

     color: '#4F46E5',

    },

   }));



   const layoutedNodes = applyLayout(reactFlowNodes, reactFlowEdges);



   setNodes(layoutedNodes);

   setEdges(reactFlowEdges);

   setTopic(topic);

  }

 }, [applyLayout]);



 return (

  <div style={{ width: "100%", height: "90vh" }}>

   <h1 className="text-2xl font-bold text-center mb-4">{topic}</h1>

   <ReactFlow

    nodes={nodes}

    edges={edges}

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

