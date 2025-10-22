import { useRef } from "react";

export const VideoPlayer = ({ videoFile, onClose }) => {
  const videoRef = useRef();

  // Controlla se è un video YouTube
  const isYouTube = videoFile && videoFile.includes('youtube');
  
  // Estrai video ID da URL YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    // Se è già un embed URL
    if (url.includes('youtube.com/embed/')) {
      return url + (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
    }
    return url;
  };

  const handleSkip = () => {
    console.log("⏭️ Video chiuso");
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      
      {isYouTube ? (
        // 🎥 VIDEO YOUTUBE EMBED
        <iframe
          ref={videoRef}
          className="w-full h-full"
          src={getYouTubeEmbedUrl(videoFile)}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        // 🎥 VIDEO LOCALE
        <video
          ref={videoRef}
          autoPlay
          controls
          className="w-full h-full object-contain"
          onEnded={onClose}
        >
          <source src={`/videos/${videoFile}`} type="video/mp4" />
          Il tuo browser non supporta i video HTML5.
        </video>
      )}

      {/* Bottone chiudi */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all z-60 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Chiudi
      </button>

      {/* Info video */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
        <p className="text-sm font-semibold">🎥 Azienda Agricola Medei</p>
      </div>
    </div>
  );
};