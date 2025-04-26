import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SpeechToText from "./components/SpeechToText";
import Topic from "./components/Topic";
import Flow from "./components/Flow";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SpeechToText />
              </>
            }
          />
          <Route path="/flow" element={<Flow />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;