import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  // ... (Keep your existing startCamera, takePhoto, and stopCamera functions here) ...
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setIsStreamReady(true);
      }
    } catch (err) {
      alert("Camera access denied");
      onClose();
    }
  };

  const takePhoto = () => {
    if (!isStreamReady || !videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.8));
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // TELEPORT TO BODY
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center">
      {/* Background overlay to block clicks to the chat app */}
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-[10001] w-full h-full flex flex-col items-center justify-between py-10 px-4">
        
        {/* Top bar with Close */}
        <div className="w-full flex justify-end max-w-2xl">
          <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white hover:bg-red-500 transition-all">
            <i className='bx bx-x text-3xl'></i>
          </button>
        </div>

        {/* Video Frame */}
        <div className="w-full max-w-md aspect-[3/4] sm:aspect-video bg-gray-900 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover -scale-x-100"
          />
          {!isStreamReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500"></div>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={takePhoto}
            disabled={!isStreamReady}
            className={`p-1 rounded-full border-4 ${isStreamReady ? 'border-white' : 'border-gray-600'}`}
          >
            <div className={`p-6 rounded-full ${isStreamReady ? 'bg-white active:scale-90' : 'bg-gray-600'} transition-all`}>
              <i className={`bx bx-camera text-4xl ${isStreamReady ? 'text-black' : 'text-gray-400'}`}></i>
            </div>
          </button>
          <p className="text-white/60 font-medium uppercase tracking-widest text-xs">Capture Photo</p>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>,
    document.body // This is the magic part
  );
};

export default CameraCapture;