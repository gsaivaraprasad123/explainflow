import React from "react";

const StickyNode = ({ data }) => {
  const { title = "Sticky Note", content = "" } = data; // fallback defaults

  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md"
      style={{ width: 250 }}
    >
      <h3 className="font-bold text-lg mb-2">{title}</h3> {/* Dynamic Title */}
      <p className="text-sm whitespace-pre-line text-gray-800">{content}</p> {/* Dynamic Content */}
    </div>
  );
};

export default StickyNode;
