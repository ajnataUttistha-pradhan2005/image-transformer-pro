import React, { useRef } from 'react';
import useImageStore from '../store/useImageStore';
import { Upload, Share, RotateCcw } from 'lucide-react';
import logo from '../assets/logo.svg';

const TopBar = () => {
  const { originalFile, setOriginalImage, reset, currentImageUrl, currentOperations } = useImageStore();
  const fileInputRef = useRef(null);

  const handleDownload = () => {
    if (!currentImageUrl) return;
    const name = window.prompt("Enter export file name:", "image_transformer_export");
    if (!name) return; // User cancelled
    const a = document.createElement('a');
    a.href = currentImageUrl;
    const ext = originalFile?.name.split('.').pop() || 'jpg';
    a.download = `${name}.${ext}`;
    a.click();
  };

  return (
    <div className="h-20 border-b border-[#212631] bg-[#0b0e14] flex items-center justify-between px-8 shrink-0 z-20">
      {/* Left side: branding inside the app area now */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Luminous Lens Logo" className="w-10 h-10 object-contain shadow-[0_0_15px_rgba(0,209,255,0.3)] rounded-lg" />
          <h1 className="text-[22px] font-display font-semibold tracking-tight text-white flex items-center gap-1">
            Image Transformer<span className="text-[#00D1FF] drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]">Pro</span>
          </h1>
        </div>
        {originalFile && (
          <div className="h-6 w-px bg-[#2f3446]" />
        )}
        {originalFile && (
          <span className="text-[#8b949e] text-xs font-mono">{originalFile.name}</span>
        )}
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
             const file = e.target.files[0];
             if (file) setOriginalImage(file);
          }}
          className="hidden"
          accept="image/jpeg, image/png, image/jpg"
        />

        {originalFile && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#BD00FF] hover:bg-[#a600e6] transition shadow-[0_0_15px_rgba(189,0,255,0.4)] text-sm font-semibold tracking-wide text-white"
          >
            <Share size={16} />
            <span>Export</span>
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full text-[#8b949e] hover:text-white hover:bg-[#181b24] transition"
          title="Upload Image"
        >
          <Upload size={18} />
        </button>

        {originalFile && (
          <button
            onClick={reset}
            className="p-2.5 rounded-full text-[#8b949e] hover:text-[#00D1FF] hover:bg-[#181b24] transition"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
