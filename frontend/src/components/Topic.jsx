import React, { useState } from 'react';

const Topic = () => {
  const [topic, setTopic] = useState("");

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <label className="block mb-2 text-lg font-semibold text-gray-700">
        What's your topic?
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full p-4 pr-12 border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Enter your topic here..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Topic;