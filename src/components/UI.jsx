import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  
  // STATI PER ACCESSORI
  const [showGlasses, setShowGlasses] = useState(true);
  const [showMustache, setShowMustache] = useState(true);
  
  // MENU ANIMAZIONI
  const [showAnimationsMenu, setShowAnimationsMenu] = useState(false);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message) {
      chat(text);
      input.current.value = "";
    }
  };
  
  const playAnimation = (animationName) => {
    window.dispatchEvent(new CustomEvent('playAnimation', { detail: animationName }));
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
          {/* MENU ANIMAZIONI */}
          {showAnimationsMenu && (
            <div className="pointer-events-auto backdrop-blur-md bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-3 text-gray-800">Animazioni</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => playAnimation("Standing Idle")}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Fermo
                </button>
                <button
                  onClick={() => playAnimation("Rumba Dancing")}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Balla
                </button>
                <button
                  onClick={() => playAnimation("Laughing")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Ride
                </button>
                <button
                  onClick={() => playAnimation("Crying")}
                  className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm"
                >
                  Piange
                </button>
                <button
                  onClick={() => playAnimation("Angry")}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Arrabbiato
                </button>
                <button
                  onClick={() => playAnimation("Talking_0")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  Parla
                </button>
              </div>
            </div>
          )}
          
          {/* CONTROLLI ACCESSORI */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowGlasses(!showGlasses);
                window.dispatchEvent(new CustomEvent('toggleGlasses', { detail: !showGlasses }));
              }}
              className={`pointer-events-auto text-white p-4 rounded-md transition-all ${
                showGlasses ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={showGlasses ? "Nascondi occhiali" : "Mostra occhiali"}
            >
              <span className="text-2xl">🕶️</span>
            </button>
            <button
              onClick={() => {
                setShowMustache(!showMustache);
                window.dispatchEvent(new CustomEvent('toggleMustache', { detail: !showMustache }));
              }}
              className={`pointer-events-auto text-white p-4 rounded-md transition-all ${
                showMustache ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
              }`}
              title={showMustache ? "Nascondi baffi" : "Mostra baffi"}
            >
              <span className="text-2xl">👨</span>
            </button>
          </div>
          
          {/* BOTTONE MENU ANIMAZIONI */}
          <button
            onClick={() => setShowAnimationsMenu(!showAnimationsMenu)}
            className={`pointer-events-auto text-white p-4 rounded-md transition-all ${
              showAnimationsMenu ? 'bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            title="Mostra/Nascondi menu animazioni"
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
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </button>
          
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
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Scrivi un messaggio a Nonno Andrea..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
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