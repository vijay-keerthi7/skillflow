import React, { useRef, useState } from 'react';
import CameraCapture from './CameraCapture';

const AttachmentMenu = ({ onImageSelect }) => {
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result);
        e.target.value = null; // Clear input so same file can be picked again
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* File Upload Button */}
      <button 
        type="button" // Prevents form submission on Enter
        onClick={() => fileInputRef.current?.click()} 
        className="text-white/40 hover:text-cyan-400 p-2 transition-colors"
      >
        <i className='bx bx-plus text-2xl'></i>
      </button>

      {/* Camera Capture Button */}
      <button 
        type="button" // Prevents form submission on Enter
        onClick={() => setShowCamera(true)}
        className="text-white/40 hover:text-cyan-400 p-2 transition-colors"
      >
        <i className='bx bx-camera text-2xl'></i>
      </button>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {showCamera && (
        <CameraCapture 
          onCapture={(img) => {
            onImageSelect(img);
            setShowCamera(false);
          }} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default AttachmentMenu;