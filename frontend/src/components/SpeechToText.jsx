import React, { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState("");
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

  return (
    <div className="w-full max-w-xl mx-auto p-4">
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
    </div>
  );
};

export default SpeechToText;
