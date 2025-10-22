import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      chat(text);
      input.current.value = "";
    }
  };

  // 🎤 Avvia/ferma registrazione vocale
  const toggleRecording = () => {
    if (isRecording) {
      // Ferma registrazione
      if (recognition) {
        recognition.stop();
      }
      setIsRecording(false);
    } else {
      // Avvia registrazione
      startVoiceRecognition();
    }
  };

  const startVoiceRecognition = () => {
    // Controlla supporto browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Il tuo browser non supporta il riconoscimento vocale. Usa Chrome, Edge o Safari.");
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    
    // Configurazione
    recognitionInstance.lang = 'it-IT'; // Italiano di default
    recognitionInstance.interimResults = false;
    recognitionInstance.maxAlternatives = 1;
    recognitionInstance.continuous = false;

    // Quando inizia
    recognitionInstance.onstart = () => {
      setIsRecording(true);
      console.log("🎤 Registrazione iniziata");
    };

    // Quando riceve risultati
    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ Trascritto:", transcript);
      input.current.value = transcript;
      setIsRecording(false);
      
      // Invia automaticamente dopo la trascrizione
      setTimeout(() => {
        if (!loading && !message) {
          chat(transcript);
          input.current.value = "";
        }
      }, 500);
    };

    // Quando finisce
    recognitionInstance.onend = () => {
      setIsRecording(false);
      console.log("🎤 Registrazione terminata");
    };

    // Gestione errori
    recognitionInstance.onerror = (event) => {
      console.error("Errore riconoscimento vocale:", event.error);
      setIsRecording(false);
      
      if (event.error === 'no-speech') {
        alert("Non ho sentito nulla. Riprova!");
      } else if (event.error === 'not-allowed') {
        alert("Devi autorizzare il microfono per usare questa funzione.");
      }
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };
  
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">Nonno Andrea</h1>
          <p>Il tuo assistente virtuale</p>
        </div>
        
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        
        {/* 💬 INPUT AREA */}
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Scrivi o parla con Nonno Andrea..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          
          {/* 🎤 BOTTONE MICROFONO */}
          <button
            onClick={toggleRecording}
            disabled={loading || message}
            className={`p-4 px-6 font-semibold rounded-md transition-all ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-green-500 hover:bg-green-600"
            } text-white ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
            title={isRecording ? "Ferma registrazione" : "Registra vocale"}
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
          
          {/* ✉️ BOTTONE INVIO */}
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-blue-500 hover:bg-blue-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            Invia
          </button>
        </div>
      </div>
    </>
  );
};