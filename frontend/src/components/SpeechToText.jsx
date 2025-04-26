import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import axios from "axios";
import {useNavigate} from "react-router-dom"

const SpeechToText = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    if (!isListening) {
      if (!recognitionRef.current) {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setText((prev) => prev + transcript + " ");
            } else {
              interimTranscript += transcript;
            }
          }
        };

        recognition.onerror = (e) => {
          console.error("Speech recognition error", e);
          if (e.error === "network") {
            alert(
              "Speech Recognition failed due to a network issue. Make sure you're on localhost or HTTPS."
            );
          }
          stopListening();
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.start();
      setIsListening(true);
    } else {
      stopListening();
    }
  };

  const stopListening = () => {
    recognitionRef.current && recognitionRef.current.stop();
    setIsListening(false);
  };

  const handleAnalyze = async () => {
    if (!topic.trim() || !text.trim()) {
      alert("Both topic and text are required before analyzing.");
      return;
    }
  
    try {
      const payload = {
        topic: topic.trim(),
        text: text.trim(),
      };
  
      const response = await axios.post("http://localhost:3000/analyze", payload);
  
      localStorage.setItem('flowData', JSON.stringify(response.data));
      navigate("/flow");
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error analyzing text:", error);
      alert("Failed to analyze text. Check console for details.");
    }
  };
  

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      {/* Topic Input */}
      <label className="block mb-2 text-lg font-semibold text-gray-700">
        What's your topic?
      </label>
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full p-4 pr-12 border rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Enter your topic here..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* Speech-to-Text Input */}
      <label className="block mb-2 text-lg font-semibold text-gray-700">
        Speak or type your message
      </label>
      <div className="relative">
        <textarea
          className="w-full h-48 p-4 pr-12 border rounded-2xl shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          placeholder="Start speaking or type here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={toggleListening}
          className={`absolute bottom-4 right-4 p-2 rounded-full shadow-md transition duration-200 ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        className="mt-4 w-full p-4 bg-green-500 text-white rounded-2xl shadow-md hover:bg-green-600 transition duration-200"
      >
        Analyze
      </button>
    </div>
  );
};

export default SpeechToText;
